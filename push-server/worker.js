// GymGrog push server: one file, no dependencies.
// POST /schedule { subscription, at, label, seq }  -> sends a silent "rest over" push at `at` (epoch ms)
// POST /cancel   { endpoint, seq }                 -> forgets the pending push for that device
// One Durable Object per push subscription holds a single alarm, so a new schedule replaces the old one
// and a cancel after Skip/OK stops it. `seq` (client clock ms) makes a late-arriving cancel harmless.

const MAX_AHEAD_MS = 30 * 60 * 1000;
const MAX_LABEL = 160;

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const url = new URL(req.url);
    if (req.method === 'GET' && url.pathname === '/') return new Response('GymGrog push server', { headers: cors });
    if (req.method === 'GET' && url.pathname === '/vapid') return new Response(env.VAPID_PUBLIC_KEY, { headers: cors });
    if (req.method !== 'POST' || !['/schedule', '/cancel'].includes(url.pathname)) return new Response('Not found', { status: 404, headers: cors });
    if (!cors['Access-Control-Allow-Origin']) return new Response('Origin not allowed', { status: 403 });
    let body;
    try { body = await req.json(); } catch (e) { return new Response('Bad JSON', { status: 400, headers: cors }); }
    const endpoint = url.pathname === '/schedule' ? body?.subscription?.endpoint : body?.endpoint;
    if (typeof endpoint !== 'string' || !/^https:\/\//.test(endpoint) || endpoint.length > 2048) return new Response('Bad endpoint', { status: 400, headers: cors });
    if (url.pathname === '/schedule') {
      const at = +body.at;
      if (!Number.isFinite(at) || at > Date.now() + MAX_AHEAD_MS || at < Date.now() - 60000) return new Response('Bad time', { status: 400, headers: cors });
      if (!body.subscription?.keys?.p256dh || !body.subscription?.keys?.auth) return new Response('Bad subscription', { status: 400, headers: cors });
      body.label = String(body.label || '').slice(0, MAX_LABEL);
    }
    const stub = env.REST.get(env.REST.idFromName(endpoint));
    const r = await stub.fetch(new Request('https://do' + url.pathname, { method: 'POST', body: JSON.stringify(body) }));
    return new Response(await r.text(), { status: r.status, headers: { ...cors, 'Content-Type': 'application/json' } });
  },
};

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const ok = allowed.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const h = { 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' };
  if (ok) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

export class RestAlarm {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch(req) {
    const url = new URL(req.url); const body = await req.json();
    const seq = +body.seq || 0; const last = (await this.state.storage.get('seq')) || 0;
    if (seq && seq < last) return json({ ok: true, ignored: 'stale' });
    await this.state.storage.put('seq', seq || last);
    if (url.pathname === '/schedule') {
      await this.state.storage.put('job', { subscription: body.subscription, label: body.label, at: +body.at });
      await this.state.storage.setAlarm(+body.at);
      return json({ ok: true, at: +body.at });
    }
    await this.state.storage.delete('job'); await this.state.storage.deleteAlarm();
    return json({ ok: true, cancelled: true });
  }
  async alarm() {
    const job = await this.state.storage.get('job');
    await this.state.storage.delete('job');
    if (!job) return;
    try {
      const res = await sendPush(job.subscription, { title: 'GymGrog · rest over', body: job.label || 'Back to it.' }, this.env);
      if (!res.ok) console.log('push failed', res.status, await res.text());
    } catch (e) { console.log('push error', String(e)); } // never throw: a retry loop would just re-send a late alert
  }
}
const json = o => new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json' } });

// ---------- Web Push (RFC 8030 + RFC 8291 aes128gcm + RFC 8292 VAPID), WebCrypto only ----------
export async function sendPush(sub, payload, env) {
  const endpoint = sub.endpoint;
  const body = await encrypt(JSON.stringify(payload), sub.keys.p256dh, sub.keys.auth);
  const jwt = await vapidJwt(new URL(endpoint).origin, env);
  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream', 'Content-Encoding': 'aes128gcm', TTL: '120', Urgency: 'high', Topic: 'gymgrog-rest',
      Authorization: `vapid t=${jwt}, k=${env.VAPID_PUBLIC_KEY}` },
    body,
  });
}

export async function encrypt(text, p256dh, auth) {
  const uaPub = b64d(p256dh), authSecret = b64d(auth);
  const asKey = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPub = new Uint8Array(await crypto.subtle.exportKey('raw', asKey.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdh = await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, asKey.privateKey, 256);
  const ikm = await hkdf(authSecret, ecdh, cat(str('WebPush: info\0'), uaPub, asPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, str('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, str('Content-Encoding: nonce\0'), 12);
  const plain = cat(str(text), new Uint8Array([2])); // 0x02 = last record delimiter, no extra padding
  const key = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, plain));
  const rs = new Uint8Array(4); new DataView(rs.buffer).setUint32(0, 4096);
  return cat(salt, rs, new Uint8Array([asPub.length]), asPub, cipher);
}

async function hkdf(salt, ikm, info, len) {
  const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, k, len * 8));
}

export async function vapidJwt(aud, env) {
  const jwk = JSON.parse(env.VAPID_PRIVATE_JWK);
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const header = b64e(str(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = b64e(str(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env.VAPID_SUBJECT })));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, str(`${header}.${claims}`));
  return `${header}.${claims}.${b64e(new Uint8Array(sig))}`;
}

const str = s => new TextEncoder().encode(s);
function cat(...arrs) { const out = new Uint8Array(arrs.reduce((n, a) => n + a.length, 0)); let o = 0; for (const a of arrs) { out.set(a, o); o += a.length; } return out; }
export function b64e(u8) { let s = ''; for (const b of u8) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
export function b64d(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); s += '='.repeat((4 - s.length % 4) % 4); return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }
