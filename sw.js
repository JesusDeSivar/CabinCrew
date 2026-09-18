/* Service worker: la app funciona sin conexión una vez visitada. */
const CACHE = 'cabincrew-v1';
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './styles/app.css',
  './js/data.js', './js/util.js', './js/srs.js', './js/store.js', './js/avatars.js',
  './js/achievements.js', './js/fx.js', './js/exercise.js', './js/app.js',
  './js/views/welcome.js', './js/views/home.js', './js/views/quiz.js',
  './js/views/review.js', './js/views/browse.js', './js/views/profile.js',
  './icons/icon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok && new URL(req.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
