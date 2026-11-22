"""CircuitPython DUCO worker with smooth circulating RGB NeoPixels & multi-sensor telemetry."""
import time
import math
import hashlib
import binascii
import gc
import microcontroller
import usb_cdc
from adafruit_circuitplayground import cp

try:
    import supervisor
    supervisor.runtime.rgb_status_brightness = 0
except Exception:
    pass

port = usb_cdc.console
port.timeout = 0.1
try:
    port.write_timeout = 0.2
except AttributeError:
    pass

uid = 'DUCOID' + binascii.hexlify(microcontroller.cpu.uid[:8]).decode().upper()


def wheel(pos):
    pos = int(pos) % 256
    if pos < 85:
        return (int(255 - pos * 3), int(pos * 3), 0)
    elif pos < 170:
        pos -= 85
        return (0, int(255 - pos * 3), int(pos * 3))
    else:
        pos -= 170
        return (int(pos * 3), 0, int(255 - pos * 3))


target_brightness = 0.05
current_brightness = 0.05
rainbow_pos = 0.0
last_anim = time.monotonic()
last_light_sample = -10.0
last_sensor_emit = -10.0
pixel_pct = 0.0
cached_celsius = 22.0
cached_level = 0

cp.pixels.brightness = current_brightness
for i in range(10):
    cp.pixels[i] = wheel(i * 25.6)
cp.pixels.show()
cp.red_led = False


def update_pixels():
    global last_anim, last_light_sample, rainbow_pos, target_brightness, current_brightness, pixel_pct, cached_level
    now = time.monotonic()
    dt = now - last_anim
    if dt < 0.035:
        return
    last_anim = now

    # Sample room light frequently (3x/sec) for responsive ambient reaction
    if now - last_light_sample > 0.3:
        last_light_sample = now
        try:
            cached_level = cp.light
            # When dark (<= 1), turn 100% completely off (0.0)
            if cached_level <= 1:
                pixel_factor = 0.0
            else:
                # Indoor room light curve (level 60-70 reaches full brightness)
                norm = min(1.0, (cached_level - 1.0) / 70.0)
                pixel_factor = math.pow(norm, 0.6)

            if not cp.switch:
                pixel_factor = 1.0 - pixel_factor

            pixel_pct = pixel_factor * 100.0

            if pixel_factor <= 0.005:
                target_brightness = 0.0
            else:
                # Scale target brightness from subtle glow up to 0.95 (vibrant high brightness)
                target_brightness = 0.02 + pixel_factor * 0.93
        except Exception:
            pass

    # Smooth exponential fade / linear interpolation between brightness states
    current_brightness += (target_brightness - current_brightness) * 0.12

    # Snap cleanly to completely OFF when in pitch darkness
    if current_brightness < 0.005 and target_brightness == 0.0:
        current_brightness = 0.0
        cp.pixels.brightness = 0.0
        cp.pixels.fill((0, 0, 0))
        cp.pixels.show()
        return

    # Gently circulating rainbow
    rainbow_pos = (rainbow_pos + 1.2) % 256.0

    cp.pixels.brightness = current_brightness
    for i in range(10):
        cp.pixels[i] = wheel((i * 25.6 + rainbow_pos) % 256.0)
    cp.pixels.show()


def emit_sensors():
    global last_sensor_emit, cached_celsius, cached_level
    now = time.monotonic()
    if now - last_sensor_emit < 10:
        return
    last_sensor_emit = now
    try:
        cached_celsius = cp.temperature
        sound = cp.sound_level
        ax, ay, az = cp.acceleration
        accel_g = math.sqrt(ax * ax + ay * ay + az * az) / 9.80665

        ram_used = gc.mem_alloc()
        ram_total = ram_used + gc.mem_free()

        if -40 <= cached_celsius <= 125 and 0 <= cached_level <= 330:
            line = 'SENSOR,{:.3f},{},{:.1f},{:.1f},{:.2f},{:.1f},{},{}\n'.format(
                cached_celsius, cached_level, now, sound, accel_g, pixel_pct, ram_used, ram_total
            )
            port.write(line.encode())
    except (OSError, RuntimeError, ValueError):
        # A disconnected USB host or unavailable sensor must not stop hashing.
        pass


port.write(b'\n')
buffer = b''
while True:
    update_pixels()
    emit_sensors()
    chunk = port.read(128)
    if not chunk:
        time.sleep(0.01)
        continue
    buffer += chunk
    if len(buffer) > 256:
        buffer = b''
        continue
    if buffer.count(b',') < 3:
        continue
    fields = buffer.split(b',', 3)
    buffer = fields[3]
    try:
        previous = fields[0]
        target = binascii.unhexlify(fields[1])
        difficulty = int(fields[2])
        if len(previous) != 40 or len(target) != 20 or not 0 <= difficulty <= 100000:
            raise ValueError('Invalid job')
        start = time.monotonic_ns()
        answer = -1
        for nonce in range(difficulty * 100 + 1):
            if hashlib.new('sha1', previous + str(nonce).encode()).digest() == target:
                answer = nonce
                break
            if nonce and nonce % 128 == 0:
                update_pixels()
                emit_sensors()
        elapsed = max(1, (time.monotonic_ns() - start) // 1000)
        if answer < 0:
            raise ValueError('No solution')
        port.write(('{:b},{:b},{}\n'.format(answer, elapsed, uid)).encode())
    except (ValueError, RuntimeError) as error:
        port.write(('ERROR,' + str(error) + '\n').encode())
