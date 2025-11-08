const CACHE = 'birdcensus-cache-v1';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil((async()=>{
    const c = await caches.open(CACHE);
    try{ await c.addAll(['./','./index.html']); }catch(_){}
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async()=>{
    const ks = await caches.keys();
    await Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async()=>{
    const c = await caches.open(CACHE);
    const cached = await c.match(e.request);
    if (cached) return cached;
    try {
      const res = await fetch(e.request);
      if (res && res.status===200 && res.type==='basic') c.put(e.request, res.clone());
      return res;
    } catch(err){ return cached || Response.error(); }
  })());
});
