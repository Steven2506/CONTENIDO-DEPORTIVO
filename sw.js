"use strict";

const CACHE_VERSION="wolfgames-pwa-20261116-phase1-cache-cleanup1";
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
  "./manifest.webmanifest",
  "./widget-data.json",
  "./widgets/wolfgames-agenda.json",
  "./widgets/wolfgames-agenda.svg",
  "./diseno.css",
  "./f1.css",
  "./f1-home.css",
  "./motogp-home-card.css",
  "./gp.css",
  "./motogp-gp.css",
  "./motogp-home.css",
  "./site.js",
  "./f1-data.js",
  "./motorsport-core.js",
  "./f1calendar.js",
  "./motogpcalendar.js",
  "./motogp-schedule-data.js",
  "./motogp-results-data.js",
  "./motogp-page.js",
  "./motogp-gp.js",
  "./gp.js",
  "./home.js",
  "./sports-widget.js",
  "./preferences.js",
  "./particles.js",
  "./weather.js",
  "./favicon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png"
];
const LIVE_DATA_FILES=new Set([
  "sports-data.js","laliga-current.js","laliga-calendar.js","football.js",
  "champions-data.js","champions-fixtures.js","champions-draw.js","champions-centre.js","champions.js","widget-data.json",
  "f1-data.js","motorsport-core.js","f1calendar.js","motogpcalendar.js","motogp-schedule-data.js","motogp-results-data.js","sports-widget.js","home.js","status.js","weather.js"
]);

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(SHELL_CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("wolfgames-")&&!key.startsWith(CACHE_VERSION)).map(key=>caches.delete(key)))).then(()=>self.clients.claim()).then(()=>refreshInstalledWindowsWidget().catch(()=>{})));
});

const WINDOWS_WIDGET_TAG="wolfgames-agenda";
const WINDOWS_WIDGET_TEMPLATE="widgets/wolfgames-agenda.json";
const WINDOWS_WIDGET_DATA="widget-data.json";

async function refreshWindowsWidget(widget){
  if(!self.widgets?.updateByTag||!widget||widget.definition?.tag!==WINDOWS_WIDGET_TAG)return;
  const base=self.registration.scope;
  const [templateResponse,dataResponse]=await Promise.all([
    fetch(new URL(WINDOWS_WIDGET_TEMPLATE,base),{cache:"no-store"}),
    fetch(new URL(WINDOWS_WIDGET_DATA,base),{cache:"no-store"})
  ]);
  if(!templateResponse.ok||!dataResponse.ok)throw new Error("No se pudieron cargar los datos de la agenda WOLFGAMES.");
  const [template,data]=await Promise.all([templateResponse.text(),dataResponse.text()]);
  await self.widgets.updateByTag(WINDOWS_WIDGET_TAG,{template,data});
}

async function refreshInstalledWindowsWidget(){
  if(!self.widgets?.getByTag||!self.widgets?.updateByTag)return;
  const widget=await self.widgets.getByTag(WINDOWS_WIDGET_TAG);
  if(widget)await refreshWindowsWidget(widget);
}

self.addEventListener("widgetinstall",event=>{
  event.waitUntil((async()=>{
    try{await self.registration.periodicSync?.register(WINDOWS_WIDGET_TAG,{minInterval:900});}catch(error){console.info("La actualización periódica del widget no está disponible.");}
    await refreshWindowsWidget(event.widget);
  })());
});

self.addEventListener("widgetresume",event=>{
  event.waitUntil(refreshWindowsWidget(event.widget));
});

self.addEventListener("widgetuninstall",event=>{
  event.waitUntil((async()=>{
    if(event.widget?.instances?.length<=1)try{await self.registration.periodicSync?.unregister(WINDOWS_WIDGET_TAG);}catch(error){console.info("No se pudo retirar la actualización periódica del widget.");}
  })());
});

self.addEventListener("periodicsync",event=>{
  if(event.tag===WINDOWS_WIDGET_TAG)event.waitUntil(refreshInstalledWindowsWidget());
});

async function networkFirst(request,{offline=false}={}){
  const cache=await caches.open(RUNTIME_CACHE);
  try{
    const response=await fetch(request,{cache:"no-store"});
    if(response.ok)await cache.put(request,response.clone());
    return response;
  }catch(error){
    const cached=await cache.match(request,{ignoreSearch:true})||await caches.match(request,{ignoreSearch:true});
    if(cached)return cached;
    if(offline)return (await caches.match("./offline.html"))||Response.error();
    throw error;
  }
}

async function cacheFirst(request){
  const cached=await caches.match(request,{ignoreSearch:true});
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
