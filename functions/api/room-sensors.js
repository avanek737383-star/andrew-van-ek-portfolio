// Same-origin, read-only Cloudflare Pages relay. No upload or board controls.
const upstream = 'https://nucwol2-0--hdd.taile72a68.ts.net/website-chat/room-sensors';
export async function onRequest({ request }) {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  if (request.method !== 'GET') return new Response(JSON.stringify({ error: 'Read-only endpoint' }), { status: 405, headers: { ...headers, Allow: 'GET' } });
  try {
    const response = await fetch(upstream, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5500), cache: 'no-store' });
    if (!response.ok) throw new Error('Upstream unavailable');
    const body = await response.text();
    if (body.length > 8192) throw new Error('Oversized snapshot');
    const data = JSON.parse(body);
    if (data.schema_version !== 1 || !['live', 'stale', 'disconnected', 'unavailable'].includes(data.status)) throw new Error('Invalid snapshot');
    return new Response(JSON.stringify(data), { headers });
  } catch (_) {
    return new Response(JSON.stringify({ schema_version: 1, status: 'unavailable', temperature_f: null, light_percent: null, mining: null }), { headers });
  }
}
