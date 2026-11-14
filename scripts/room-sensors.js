(() => {
  'use strict';
  const root = document.getElementById('room-sensors');
  if (!root) return;
  const endpoint = '/api/room-sensors';
  const ids = Object.fromEntries(['room-sensors-status', 'room-temperature-value', 'room-temperature-description',
    'room-temperature-meter', 'room-light-value', 'room-light-description', 'room-light-meter',
    'room-sensors-updated', 'room-mining-status'].map(id => [id, document.getElementById(id)]));
  let latest = null, receivedAt = 0, reachable = true, pending = false;
  const clamp = value => Math.max(0, Math.min(100, value));
  const text = (id, value) => { if (ids[id].textContent !== value) ids[id].textContent = value; };
  const temperatureLabel = f => f < 65 ? 'Cool' : f < 78 ? 'Mild' : f < 86 ? 'Warm' : 'Hot';
  const lightLabel = percent => percent < 1 ? 'Dark' : percent < 12 ? 'Dim' : percent < 40 ? 'Moderate' : percent < 80 ? 'Bright' : 'Very bright';

  function render() {
    if (!latest || latest.status === 'unavailable') {
      root.dataset.state = 'offline';
      root.dataset.hasReading = 'false';
      text('room-temperature-value', '—'); text('room-light-value', '—');
      text('room-temperature-description', 'Reading unavailable'); text('room-light-description', 'Reading unavailable');
      for (const id of ['room-temperature-meter', 'room-light-meter']) {
        ids[id].setAttribute('role', 'img');
        ids[id].setAttribute('aria-label', 'Reference scale; reading unavailable');
        for (const attribute of ['aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext']) ids[id].removeAttribute(attribute);
      }
      text('room-sensors-status', 'Offline');
      text('room-sensors-updated', 'Waiting for the board');
      text('room-mining-status', 'Miner status unavailable');
      return;
    }
    const elapsed = (performance.now() - receivedAt) / 1000;
    const age = Math.max(0, latest.age_seconds + elapsed);
    const state = !reachable ? 'offline' : latest.status === 'disconnected' ? 'disconnected' : age > 60 ? 'stale' : latest.status;
    root.dataset.state = state;
    root.dataset.hasReading = 'true';
    text('room-sensors-status', state === 'live' ? 'Live' : state === 'disconnected' ? 'Board disconnected' : state === 'stale' ? 'Last reading' : 'Connection interrupted');
    const temp = latest.temperature_f, light = latest.light_percent;
    const tempDescription = temperatureLabel(temp), lightDescription = lightLabel(light);
    text('room-temperature-value', temp.toFixed(1));
    text('room-temperature-description', tempDescription);
    text('room-light-value', light > 0 && light < 1 ? '<1' : String(Math.round(light)));
    text('room-light-description', lightDescription);
    for (const id of ['room-temperature-meter', 'room-light-meter']) ids[id].setAttribute('role', 'meter');
    ids['room-temperature-meter'].setAttribute('aria-label', 'Temperature reference');
    ids['room-temperature-meter'].setAttribute('aria-valuemin', '50');
    ids['room-temperature-meter'].setAttribute('aria-valuemax', '95');
    ids['room-light-meter'].setAttribute('aria-label', 'Relative light level');
    ids['room-light-meter'].setAttribute('aria-valuemin', '0');
    ids['room-light-meter'].setAttribute('aria-valuemax', '100');
    ids['room-temperature-meter'].style.setProperty('--position', clamp((temp - 50) / 45 * 100) + '%');
    ids['room-temperature-meter'].setAttribute('aria-valuenow', String(Math.max(50, Math.min(95, temp))));
    ids['room-temperature-meter'].setAttribute('aria-valuetext', `${temp.toFixed(1)} degrees Fahrenheit, ${tempDescription}`);
    ids['room-light-meter'].style.setProperty('--position', clamp(light) + '%');
    ids['room-light-meter'].setAttribute('aria-valuenow', String(light));
    ids['room-light-meter'].setAttribute('aria-valuetext', `${light.toFixed(1)} percent relative light, ${lightDescription}`);
    const ageText = age < 60 ? `${Math.floor(age)}s ago` : age < 3600 ? `${Math.floor(age / 60)}m ago` : `${Math.floor(age / 3600)}h ago`;
    text('room-sensors-updated', `Last sample ${ageText}`);
    const mining = latest.mining;
    const miningAge = mining ? (Date.parse(latest.served_at) - Date.parse(mining.updated_at)) / 1000 + elapsed : Infinity;
    if (state === 'live' && mining && miningAge <= 90 && mining.status === 'mining') {
      const rate = mining.hashrate_hs >= 1000 ? (mining.hashrate_hs / 1000).toFixed(1) + ' kH/s' : Math.round(mining.hashrate_hs) + ' H/s';
      text('room-mining-status', `Mining · ${rate}`);
      ids['room-mining-status'].title = `${mining.accepted_shares} accepted shares since the host started`;
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
