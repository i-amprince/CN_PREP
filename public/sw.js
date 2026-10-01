// Offline support: precache every built asset on install, then serve cache-first.
const CACHE = 'packet-notes-v2';
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const urls = ['./', './index.html', './favicon.svg'];
    try {
      const res = await fetch('./asset-manifest.json', { cache: 'no-store' });
      const man = await res.json();
      for (const k in man) {
        const ent = man[k];
        urls.push('./' + ent.file);
        (ent.css || []).forEach((c) => urls.push('./' + c));
      }
    } catch (err) { /* dev or no manifest: runtime caching still works */ }
    await cache.addAll([...new Set(urls)]).catch(() => {});
    self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isFont = url.host.includes('fonts.googleapis.com') || url.host.includes('fonts.gstatic.com');
  if (url.origin !== location.origin && !isFont) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // HTML: network first so new deploys show up; everything else: cache first.
    if (req.mode === 'navigate') {
      try { const fresh = await fetch(req); cache.put('./index.html', fresh.clone()); return fresh; }
      catch { return (await cache.match('./index.html', { ignoreVary: true })) || Response.error(); }
    }
    const hit = await cache.match(req, { ignoreVary: true });
    if (hit) return hit;
    try { const res = await fetch(req); if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }
    catch { return Response.error(); }
  })());
});
