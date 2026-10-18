// Service worker de Agenda del Gerente v2. Red primero, caché como respaldo.
// OJO: los repos de GitHub Pages de José comparten dominio, así que el nombre del caché
// lleva prefijo propio y al limpiar solo se borran cachés con ESE prefijo.
const CACHE_VERSION = 'v9';
const PREFIX = 'agenda-gerente2-';
const CACHE_NAME = PREFIX + CACHE_VERSION;
const CORE_ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(CORE_ASSETS)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.filter((n) => n.startsWith(PREFIX) && n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});
function fetchConTimeout(req, ms = 4000){
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject('timeout'), ms);
    fetch(req).then((r) => { clearTimeout(t); resolve(r); }, (e) => { clearTimeout(t); reject(e); });
  });
}
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetchConTimeout(req)
      .then((resp) => { const copy = resp.clone(); caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {}); return resp; })
      .catch(() => caches.match(req).then((cached) => cached || Promise.reject('sin caché')))
  );
});
