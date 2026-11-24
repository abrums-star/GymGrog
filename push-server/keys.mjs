// Generates a VAPID key pair. Run once: `npm run keys`.
// Paste the public key into app.js (PUSH.vapid) and wrangler.toml (VAPID_PUBLIC_KEY);
// store the private JWK with `wrangler secret put VAPID_PRIVATE_JWK` (never commit it).
const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const pub = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey));
const priv = await crypto.subtle.exportKey('jwk', kp.privateKey);
const b64 = u8 => Buffer.from(u8).toString('base64url');
console.log('VAPID_PUBLIC_KEY=' + b64(pub));
console.log('VAPID_PRIVATE_JWK=' + JSON.stringify({ kty: 'EC', crv: 'P-256', x: priv.x, y: priv.y, d: priv.d }));
