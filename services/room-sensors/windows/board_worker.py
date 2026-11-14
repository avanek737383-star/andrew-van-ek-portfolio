"""CircuitPython DUCO worker with temperature/light telemetry; loaded by its host."""
import time
import hashlib
import binascii
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
cp.pixels.brightness = 0
cp.pixels.fill((0, 0, 0))
cp.pixels.show()
cp.red_led = False
last_sensor = -10.0


def emit_sensors():
    global last_sensor
    now = time.monotonic()
    if now - last_sensor < 10:
        return
    last_sensor = now
    try:
        celsius = cp.temperature
        level = cp.light  # Adafruit's relative 0..330 scale; not calibrated lux.
        if -40 <= celsius <= 125 and 0 <= level <= 330:
            line = 'SENSOR,{:.3f},{},{:.1f}\n'.format(celsius, level, now)
            port.write(line.encode())
    except (OSError, RuntimeError, ValueError):
        # A disconnected USB host or unavailable sensor must not stop hashing.
        pass


port.write(b'\n')
buffer = b''
while True:
    emit_sensors()
    chunk = port.read(128)
    if not chunk:
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
            if nonce and nonce % 1024 == 0:
                emit_sensors()
        elapsed = max(1, (time.monotonic_ns() - start) // 1000)
        if answer < 0:
            raise ValueError('No solution')
        port.write(('{:b},{:b},{}\n'.format(answer, elapsed, uid)).encode())
    except (ValueError, RuntimeError) as error:
        port.write(('ERROR,' + str(error) + '\n').encode())
