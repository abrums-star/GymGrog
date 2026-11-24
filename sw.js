const CACHE = 'gymgrog-v8';
const FILES = ['./', './index.html', './styles.css', './app.js', './data.js', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png'];
const IMAGES = ['./img/assisted-pullup-0.jpg','./img/assisted-pullup-1.jpg','./img/back-extension-0.jpg','./img/back-extension-1.jpg','./img/bike-0.jpg','./img/bike-1.jpg','./img/cable-fly-0.jpg','./img/cable-fly-1.jpg','./img/cable-pullthrough-0.jpg','./img/cable-pullthrough-1.jpg','./img/calf-raise-0.jpg','./img/calf-raise-1.jpg','./img/seated-calf-raise-0.jpg','./img/seated-calf-raise-1.jpg','./img/leg-press-calf-0.jpg','./img/leg-press-calf-1.jpg','./img/db-calf-raise-0.jpg','./img/db-calf-raise-1.jpg','./img/chest-press-machine-0.jpg','./img/chest-press-machine-1.jpg','./img/chest-supported-row-0.jpg','./img/chest-supported-row-1.jpg','./img/cross-trainer-0.jpg','./img/cross-trainer-1.jpg','./img/db-bench-0.jpg','./img/db-bench-1.jpg','./img/db-rdl-0.jpg','./img/db-rdl-1.jpg','./img/db-row-0.jpg','./img/db-row-1.jpg','./img/face-pull-0.jpg','./img/face-pull-1.jpg','./img/goblet-squat-0.jpg','./img/goblet-squat-1.jpg','./img/hack-squat-0.jpg','./img/hack-squat-1.jpg','./img/incline-walk-0.jpg','./img/incline-walk-1.jpg','./img/kb-swing-0.jpg','./img/kb-swing-1.jpg','./img/lat-pulldown-neutral-0.jpg','./img/lat-pulldown-neutral-1.jpg','./img/lat-pulldown-wide-0.jpg','./img/lat-pulldown-wide-1.jpg','./img/lateral-raise-0.jpg','./img/lateral-raise-1.jpg','./img/leg-curl-0.jpg','./img/leg-curl-1.jpg','./img/leg-extension-0.jpg','./img/leg-extension-1.jpg','./img/leg-press-0.jpg','./img/leg-press-1.jpg','./img/plank-0.jpg','./img/plank-1.jpg','./img/pushup-0.jpg','./img/pushup-1.jpg','./img/reverse-pec-deck-0.jpg','./img/reverse-pec-deck-1.jpg','./img/rower-0.jpg','./img/rower-1.jpg','./img/seated-cable-row-0.jpg','./img/seated-cable-row-1.jpg','./img/shoulder-press-machine-0.jpg','./img/shoulder-press-machine-1.jpg','./img/side-plank-0.jpg','./img/side-plank-1.jpg','./img/sled-push-0.jpg','./img/sled-push-1.jpg','./img/smith-squat-0.jpg','./img/smith-squat-1.jpg','./img/walking-lunge-0.jpg','./img/walking-lunge-1.jpg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => { await c.addAll(FILES); await Promise.all(IMAGES.map(u => c.add(u).catch(() => {}))); }));
  self.skipWaiting();
});
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request)));
});
// Tapping the silent "rest over" notification brings the app back.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow('./')));
});
