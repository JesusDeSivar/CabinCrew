/* Service worker.
   Red primero para los archivos de la app: así cada despliegue llega al
   instante y la caché queda sólo como respaldo cuando no hay conexión.
   Sube CACHE al cambiar esta estrategia: al activarse borra las anteriores. */
const CACHE = 'cabincrew-v2';
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './styles/app.css',
  './js/data.js', './js/util.js', './js/srs.js', './js/store.js', './js/avatars.js',
  './js/achievements.js', './js/fx.js', './js/exercise.js', './js/app.js',
  './js/views/welcome.js', './js/views/home.js', './js/views/quiz.js',
  './js/views/review.js', './js/views/browse.js', './js/views/profile.js',
  './icons/icon.svg'
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* Guarda una copia fresca sin bloquear la respuesta */
function keep(req, res) {
  if (res && res.ok) {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
  }
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  /* Tipografías: inmutables, caché primero */
  if (FONT_HOSTS.includes(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => keep(req, res))));
    return;
  }

  if (url.origin !== location.origin) return;

  /* La app: red primero, caché de respaldo */
  e.respondWith(
    fetch(req)
      .then(res => keep(req, res))
      .catch(() => caches.match(req).then(hit =>
        hit || (req.mode === 'navigate' ? caches.match('./index.html') : Promise.reject(new Error('sin conexión')))
      ))
  );
});
