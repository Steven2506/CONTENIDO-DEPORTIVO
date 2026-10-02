"use strict";

const CACHE_VERSION="wolfgames-pwa-20261002-editorial1";
const SHELL_CACHE=`${CACHE_VERSION}-shell`;
const RUNTIME_CACHE=`${CACHE_VERSION}-runtime`;
const APP_SHELL=[
  "./",
  "./index.html",
  "./directos.html",
  "./deportes.html",
  "./F1.html",
  "./gp.html",
  "./motogp-gp.html",
  "./MotoGP.html",
  "./sobremi.html",
  "./offline.html",
  "./diseno.css?v=20261002-editorial1",
  "./f1.css?v=20260929-f1-home1",
  "./f1-home.css?v=20260929-f1-home1",
  "./motogp-home-card.css?v=20261002-home-card1",
  "./gp.css?v=20260929-gp-countdown1",
  "./motogp-gp.css?v=20260930-motogp-ui1",
  "./motogp-home.css?v=20261001-motogp-results1",
  "./site.js?v=20260914-performance1",
  "./f1-data.js?v=20260929-gp-master1",
  "./motorsport-core.js?v=20260930-points8-9",
  "./f1calendar.js?v=20260930-points8-9",
  "./motogpcalendar.js?v=20261001-motogp-results1",
  "./motogp-results-data.js?v=20261001-motogp-results1",
  "./motogp-page.js?v=20261001-motogp-results1",
  "./motogp-gp.js?v=20261001-motogp-results1",
  "./gp.js?v=20260929-gp-countdown1",
  "./home.js?v=20260930-points8-9",
  "./sports-widget.js?v=20260930-points8-9",
  "./preferences.js?v=20260930-points8-9",
  "./particles.js?v=20260914-performance1",
  "./favicon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];
const LIVE_DATA_FILES=new Set([
  "sports-data.js","laliga-current.js","laliga-calendar.js","football.js",
  "champions-data.js","champions-fixtures.js","champions-draw.js","champions-centre.js","champions.js",
  "f1-data.js","motorsport-core.js","f1calendar.js","motogpcalendar.js","motogp-results-data.js","sports-widget.js","home.js","status.js","weather.js"
]);

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(SHELL_CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("wolfgames-")&&!key.startsWith(CACHE_VERSION)).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

async function networkFirst(request,{offline=false}={}){
  const cache=await caches.open(RUNTIME_CACHE);
  try{
    const response=await fetch(request,{cache:"no-store"});
    if(response.ok)await cache.put(request,response.clone());
    return response;
  }catch(error){
    const cached=await cache.match(request)||await caches.match(request);
    if(cached)return cached;
    if(offline)return (await caches.match("./offline.html"))||Response.error();
    throw error;
  }
}

async function cacheFirst(request){
  const cached=await caches.match(request);
  if(cached)return cached;
  const response=await fetch(request);
  if(response.ok)(await caches.open(RUNTIME_CACHE)).put(request,response.clone());
  return response;
}

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(request.mode==="navigate"){
    event.respondWith(networkFirst(request,{offline:true}));
    return;
  }
  if(LIVE_DATA_FILES.has(url.pathname.split("/").pop())){
    event.respondWith(networkFirst(request));
    return;
  }
  if(["script","style","image","font"].includes(request.destination))event.respondWith(cacheFirst(request));
});

self.addEventListener("message",event=>{
  if(event.data?.type==="SKIP_WAITING")self.skipWaiting();
});
