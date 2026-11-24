// Round-trip test: encrypt like the Worker, decrypt like a browser (RFC 8291), verify the VAPID JWT.
import { readFileSync } from 'node:fs';
import { sendPush, b64e, b64d } from './worker.js';
const env = Object.fromEntries(readFileSync('.dev.vars', 'utf8').trim().split('\n').map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
env.VAPID_PUBLIC_KEY = readFileSync('wrangler.toml', 'utf8').match(/VAPID_PUBLIC_KEY = "([^"]+)"/)[1];
env.VAPID_SUBJECT = 'https://example.test/';

// A fake browser subscription
const ua = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
const uaPub = new Uint8Array(await crypto.subtle.exportKey('raw', ua.publicKey));
const auth = crypto.getRandomValues(new Uint8Array(16));
const sub = { endpoint: 'https://web.push.apple.com/fake', keys: { p256dh: b64e(uaPub), auth: b64e(auth) } };

let captured;
globalThis.fetch = async (url, init) => { captured = { url, init }; return new Response('', { status: 201 }); };
const res = await sendPush(sub, { title: 'GymGrog · rest over', body: 'Next: set 2 of 3, Leg press' }, env);
if (res.status !== 201) throw new Error('bad status');
const h = captured.init.headers; const body = new Uint8Array(await new Response(captured.init.body).arrayBuffer());

// Decrypt
const salt = body.slice(0, 16), rs = new DataView(body.buffer).getUint32(16), idlen = body[20], asPub = body.slice(21, 21 + idlen), cipher = body.slice(21 + idlen);
if (rs !== 4096 || idlen !== 65) throw new Error('bad header');
const asKey = await crypto.subtle.importKey('raw', asPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
const ecdh = await crypto.subtle.deriveBits({ name: 'ECDH', public: asKey }, ua.privateKey, 256);
const str = s => new TextEncoder().encode(s), cat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; };
const hkdf = async (salt, ikm, info, len) => new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']), len * 8));
const ikm = await hkdf(auth, ecdh, cat(str('WebPush: info\0'), uaPub, asPub), 32);
const cek = await hkdf(salt, ikm, str('Content-Encoding: aes128gcm\0'), 16), nonce = await hkdf(salt, ikm, str('Content-Encoding: nonce\0'), 12);
const plain = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['decrypt']), cipher));
if (plain.at(-1) !== 2) throw new Error('bad delimiter');
const msg = JSON.parse(new TextDecoder().decode(plain.slice(0, -1)));
if (msg.body !== 'Next: set 2 of 3, Leg press') throw new Error('payload mismatch');
console.log('payload decrypts:', msg);

// Verify VAPID
const m = h.Authorization.match(/^vapid t=([^,]+), k=(.+)$/); if (!m) throw new Error('bad auth header');
if (m[2] !== env.VAPID_PUBLIC_KEY) throw new Error('k mismatch');
const [hd, cl, sg] = m[1].split('.');
const pubKey = await crypto.subtle.importKey('raw', b64d(m[2]), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
const okSig = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pubKey, b64d(sg), str(`${hd}.${cl}`));
const claims = JSON.parse(new TextDecoder().decode(b64d(cl)));
if (!okSig || claims.aud !== 'https://web.push.apple.com' || claims.exp > Date.now() / 1000 + 86400) throw new Error('bad jwt ' + JSON.stringify(claims));
console.log('vapid ok:', claims, 'headers:', { ...h, Authorization: 'vapid …' });
console.log('ALL GOOD');
