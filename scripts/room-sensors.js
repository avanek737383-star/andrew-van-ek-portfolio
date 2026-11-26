(() => {
  'use strict';
  const root = document.getElementById('room-sensors');
  const isStats = !!document.getElementById('stat-edge-ram-pct');
  if (!root && !isStats) return;
  const endpoint = '/api/room-sensors';
  const ids = Object.fromEntries([
    'room-sensors-status',
    'room-temperature-value', 'room-temperature-description', 'room-temperature-meter',
    'room-light-value', 'room-light-description', 'room-light-meter',
    'room-neopixel-badge',
    'room-sound-value', 'room-sound-description', 'room-sound-meter',
    'room-accel-value', 'room-accel-description', 'room-accel-meter',
    'room-ram-value', 'room-ram-description', 'room-ram-meter', 'room-ram-badge',
    'room-sensors-updated', 'room-mining-status'
  ].map(id => [id, document.getElementById(id)]));

  let latest = null, receivedAt = 0, reachable = true, pending = false;
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
  const text = (id, value) => { if (ids[id] && ids[id].textContent !== value) ids[id].textContent = value; };

  const temperatureLabel = f => f < 65 ? 'Cool' : f < 78 ? 'Mild' : f < 86 ? 'Warm' : 'Hot';
  const lightLabel = percent => percent < 1 ? 'Dark' : percent < 12 ? 'Dim' : percent < 40 ? 'Moderate' : percent < 80 ? 'Bright' : 'Very bright';
  const soundLabel = s => s < 25 ? 'Quiet workspace' : s < 50 ? 'Mild ambient' : s < 100 ? 'Active sound' : 'Loud noise';
  const accelLabel = g => (g >= 0.96 && g <= 1.04) ? 'Desk resting · Stable' : g > 1.15 ? 'Vibration / Movement' : g < 0.85 ? 'Freefall / Lift' : 'Tilted';

  function render() {
    if (!latest || latest.status === 'unavailable') {
      if (root) { root.dataset.state = 'offline'; root.dataset.hasReading = 'false'; }
      for (const id of ['stat-edge-ram-pct','stat-edge-accel']) {
        const el=document.getElementById(id); if(el)el.textContent='—';
      }
      for (const id of ['stat-edge-ram-detail','stat-edge-accel-detail']) {
        const el=document.getElementById(id); if(el)el.textContent='Reading unavailable';
      }
      text('room-temperature-value', '—'); text('room-light-value', '—');
      text('room-sound-value', '—'); text('room-accel-value', '—'); text('room-ram-value', '—');
      text('room-temperature-description', 'Reading unavailable');
      text('room-light-description', 'Reading unavailable');
      text('room-sound-description', 'Reading unavailable');
      text('room-accel-description', 'Reading unavailable');
      text('room-ram-description', 'Reading unavailable');
      text('room-neopixel-badge', 'RGB LEDs: —');
      text('room-sensors-status', 'Offline');
      text('room-sensors-updated', 'Waiting for the board');
      text('room-mining-status', 'Miner status unavailable');
      return;
    }

    const elapsed = (performance.now() - receivedAt) / 1000;
    const age = Math.max(0, latest.age_seconds + elapsed);
    const state = !reachable ? 'offline' : latest.status === 'disconnected' ? 'disconnected' : age > 60 ? 'stale' : latest.status;
    if (root) { root.dataset.state = state; root.dataset.hasReading = 'true'; }
    text('room-sensors-status', state === 'live' ? 'Live' : state === 'disconnected' ? 'Board disconnected' : state === 'stale' ? 'Last reading' : 'Connection interrupted');

    // 1. Temperature
    const temp = latest.temperature_f;
    const tempDescription = temperatureLabel(temp);
    text('room-temperature-value', temp.toFixed(1));
    text('room-temperature-description', tempDescription);
    if (ids['room-temperature-meter']) {
      ids['room-temperature-meter'].style.setProperty('--position', clamp((temp - 50) / 45 * 100) + '%');
    }

    // 2. Room Light & NeoPixels
    const light = latest.light_percent;
    const lightDescription = lightLabel(light);
    text('room-light-value', light > 0 && light < 1 ? '<1' : String(Math.round(light)));
    if (latest.neopixel_pct !== null && latest.neopixel_pct !== undefined) {
      const np = Math.round(latest.neopixel_pct);
      text('room-neopixel-badge', `RGB LEDs: ${np}% Glow`);
      text('room-light-description', `${lightDescription} · NeoPixels tracking room at ${np}%`);
    } else {
      text('room-neopixel-badge', 'RGB LEDs: Standby');
      text('room-light-description', lightDescription);
    }
    if (ids['room-light-meter']) {
      ids['room-light-meter'].style.setProperty('--position', clamp(light) + '%');
    }

    // 3. Sound / Acoustics
    if (latest.sound_level !== null && latest.sound_level !== undefined) {
      const snd = latest.sound_level;
      text('room-sound-value', snd.toFixed(1));
      text('room-sound-description', soundLabel(snd));
      if (ids['room-sound-meter']) {
        ids['room-sound-meter'].style.setProperty('--position', clamp(snd / 120 * 100) + '%');
      }
    } else {
      text('room-sound-value', '—');
      text('room-sound-description', 'Pending worker update');
    }

    // 4. Accelerometer / Stability
    if (latest.accel_g !== null && latest.accel_g !== undefined) {
      const g = latest.accel_g;
      text('room-accel-value', g.toFixed(2));
      text('room-accel-description', accelLabel(g));
      if (ids['room-accel-meter']) {
        const accelPos = clamp((g - 0.5) / 1.0 * 100);
        ids['room-accel-meter'].style.setProperty('--position', accelPos + '%');
      }
    } else {
      text('room-accel-value', '—');
      text('room-accel-description', 'Pending worker update');
    }

    // 5. Microcontroller RAM
    if (latest.ram_used_kb !== null && latest.ram_used_kb !== undefined && latest.ram_total_kb) {
      const ramKb = latest.ram_used_kb;
      const totalKb = latest.ram_total_kb;
      const ramPct = latest.ram_percent !== null ? latest.ram_percent : Math.round((ramKb / totalKb) * 100);
      text('room-ram-value', ramKb.toFixed(1));
      text('room-ram-description', `${ramKb.toFixed(1)} KB used of ${Math.round(totalKb)} KB heap (${ramPct.toFixed(1)}% memory load)`);
      if (ids['room-ram-meter']) {
        ids['room-ram-meter'].style.setProperty('--position', clamp(ramPct) + '%');
      }
      text('room-ram-badge', `nRF52840 · ${ramPct.toFixed(0)}% RAM Load`);
    } else {
      text('room-ram-value', '—');
      text('room-ram-description', 'Pending worker update');
    }

        // Stats page telemetry cards update
    const ramPctEl = document.getElementById('stat-edge-ram-pct');
    const ramDetailEl = document.getElementById('stat-edge-ram-detail');
    const ramBarEl = document.getElementById('stat-edge-ram-bar');
    if (ramPctEl && latest && Number.isFinite(latest.ram_percent)) {
      ramPctEl.textContent = `${Math.round(latest.ram_percent)}%`;
      if (ramDetailEl) ramDetailEl.textContent = Number.isFinite(latest.ram_used_kb) && Number.isFinite(latest.ram_total_kb) ? `${latest.ram_used_kb.toFixed(1)} KB utilized of ${Math.round(latest.ram_total_kb)} KB reported heap` : 'Memory detail unavailable';
      if (ramBarEl) ramBarEl.style.width = `${clamp(latest.ram_percent)}%`;
    }

    const accelEl = document.getElementById('stat-edge-accel');
    const accelDetailEl = document.getElementById('stat-edge-accel-detail');
    const accelBarEl = document.getElementById('stat-edge-accel-bar');
    if (accelEl && latest && Number.isFinite(latest.accel_g)) {
      const g = latest.accel_g;
      accelEl.textContent = g.toFixed(2);
      if (accelDetailEl) accelDetailEl.textContent = accelLabel(g);
      if (accelBarEl) accelBarEl.style.width = `${clamp((g / 2.0) * 100)}%`;
    }

    // Updated and Mining
    const ageText = age < 60 ? `${Math.floor(age)}s ago` : age < 3600 ? `${Math.floor(age / 60)}m ago` : `${Math.floor(age / 3600)}h ago`;
    text('room-sensors-updated', `Last sample ${ageText}`);
    const mining = latest.mining;
    const miningAge = mining ? (Date.parse(latest.served_at) - Date.parse(mining.updated_at)) / 1000 + elapsed : Infinity;
    if (state === 'live' && mining && miningAge <= 90 && mining.status === 'mining') {
      const rate = mining.hashrate_hs >= 1000 ? (mining.hashrate_hs / 1000).toFixed(1) + ' kH/s' : Math.round(mining.hashrate_hs) + ' H/s';
      text('room-mining-status', `Mining · ${rate} (${latest.cpu_info || '100% CPU'})`);
      if (ids['room-mining-status']) {
        ids['room-mining-status'].title = `${mining.accepted_shares} accepted shares since the host started`;
      }
    } else {
      text('room-mining-status', state === 'live' && mining && miningAge <= 90 ? 'Miner reconnecting' : 'Miner status unavailable');
    }
  }

  async function refresh() {
    if (pending || document.hidden) return;
    pending = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch(endpoint, { cache: 'no-store', credentials: 'omit', signal: controller.signal });
      if (!response.ok) throw new Error('Telemetry unavailable');
      const data = await response.json();
      if (data.schema_version !== 1 || !['live', 'stale', 'disconnected', 'unavailable'].includes(data.status)) throw new Error('Invalid snapshot');
      if (data.status !== 'unavailable' && (!Number.isFinite(data.temperature_f) || !Number.isFinite(data.light_percent) ||
          !Number.isFinite(data.age_seconds) || data.temperature_f < -40 || data.temperature_f > 257 || data.light_percent < 0 || data.light_percent > 100)) throw new Error('Invalid reading');
      latest = data; receivedAt = performance.now(); reachable = true;
    } catch (_) { reachable = false; }
    finally { clearTimeout(timeout); pending = false; render(); }
  }
  refresh();
  setInterval(refresh, 10000);
  setInterval(render, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
