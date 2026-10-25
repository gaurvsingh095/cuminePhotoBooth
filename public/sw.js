/** SMEMR Photo Booth offline shell. Never cache gallery APIs or user data. */
const CACHE='smemr-booth-v6-guided';
const PRECACHE=['/','/index.html','/halloween.html','/manifest.json','/css/main.css','/css/halloween.css','/css/booth-wizard.css','/js/templates.js','/js/app.js','/js/halloween.js','/js/halloween-pose.js','/js/halloween-frames.js','/js/booth-wizard.js','/js/wall-store.js','/js/gallery-store.js','/assets/logos/SMEMR.svg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>Promise.allSettled(PRECACHE.map(url=>cache.add(url)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('smemr-booth-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
  const shell=request.mode==='navigate'||/\.(?:js|mjs|css|html)$/.test(url.pathname);
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    if(shell){
      try{const response=await fetch(request);if(response.ok)event.waitUntil(cache.put(request,response.clone()));return response}
      catch{return await cache.match(request)||(request.mode==='navigate'?await cache.match('/index.html'):undefined)||Response.error()}
    }
    const cached=await cache.match(request);if(cached)return cached;
    try{const response=await fetch(request);if(response.ok&&!url.pathname.startsWith('/vendor/'))event.waitUntil(cache.put(request,response.clone()));return response}
    catch{return Response.error()}
  })());
});