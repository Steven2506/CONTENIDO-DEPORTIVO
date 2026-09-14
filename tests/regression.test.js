"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const test=require("node:test");

function loadFootball(){
  const context={}; context.globalThis=context; vm.createContext(context);
  vm.runInContext(fs.readFileSync("laliga-calendar.js","utf8"),context);
  vm.runInContext(fs.readFileSync("sports-data.js","utf8")+"\nglobalThis.__data=footballData;",context);
  vm.runInContext(fs.readFileSync("laliga-current.js","utf8"),context);
  return context.__data;
}
function loadFixtures(){
  const context={}; context.globalThis=context; vm.createContext(context);
  vm.runInContext(fs.readFileSync("champions-data.js","utf8"),context);
  vm.runInContext(fs.readFileSync("champions-fixtures.js","utf8")+"\nglobalThis.__fixtures=officialChampionsFixtures;",context);
  return context.__fixtures;
}
test("ningún partido finalizado carece de marcador",()=>{
  const data=loadFootball();
  for(const [round,matches] of Object.entries(data.laligaRounds)){
    for(const match of matches){
      if(match.state==="finished"||match.status==="Finalizado"){
        assert(Number.isInteger(match.homeScore)&&Number.isInteger(match.awayScore),`Jornada ${round}: ${match.home}–${match.away}`);
      }
    }
  }
  for(const match of loadFixtures()){
    if(match.state==="finished") assert(Number.isInteger(match.homeScore)&&Number.isInteger(match.awayScore),`Champions: ${match.home}–${match.away}`);
  }
});
test("los minutos y añadidos tienen rangos plausibles",()=>{
  for(const match of Object.values(loadFootball().laligaRounds).flat()){
    if(match.minute==null) continue;
    if(typeof match.minute==="number") assert(match.minute>=0&&match.minute<=130,`${match.home}: minuto ${match.minute}`);
    else {
      const parsed=String(match.minute).match(/^(45|90|105|120)\+(\d{1,2})$/);
      assert(parsed,`${match.home}: formato de minuto ${match.minute}`);
      assert(Number(parsed[2])<=20,`${match.home}: añadido imposible ${match.minute}`);
    }
  }
});
test("ningún directo lleva más de cuatro horas abierto",()=>{
  const now=Date.now();
  for(const match of Object.values(loadFootball().laligaRounds).flat()){
    if(match.state==="live"&&match.iso) assert(now-new Date(match.iso).getTime()<4*60*60*1000,`${match.home}–${match.away} sigue en directo`);
  }
});
test("la pestaña En directo y la portada recorren todas las jornadas",()=>{
  for(const path of ["football.js","home.js"]){
    const source=fs.readFileSync(path,"utf8");
    assert.match(source,/Object\.values\(footballData\.laligaRounds\|\|\{\}\)\.flat\(\)/,`${path} no usa la lista global`);
  }
});
test("F1 y MotoGP avanzan a la siguiente sesión",()=>{
  const f1=fs.readFileSync("f1calendar.js","utf8");
  const moto=fs.readFileSync("motogpcalendar.js","utf8");
  assert.match(f1,/sessions\.find\(session=>f1SessionEnd\(session\)>now\)/);
  assert.match(moto,/sessions\?\.find\(session=>new Date\(session\.start\)\.getTime\(\)\+session\.duration\*60000>Date\.now\(\)\)/);
});

test("las fichas completas siguen disponibles en ambas competiciones",()=>{const league=fs.readFileSync("football.js","utf8"),champions=fs.readFileSync("champions.js","utf8");assert.match(league,/lineup-subs/);assert.match(league,/Tarjeta amarilla/);assert.match(champions,/openChampionsDetails/);assert.match(champions,/champions-detail-trigger/);});

test("Champions cambia automáticamente al cuadro eliminatorio completo",()=>{const source=fs.readFileSync("champions.js","utf8"),centre=fs.readFileSync("champions-centre.js","utf8"),css=fs.readFileSync("diseno.css","utf8");assert.match(source,/knockoutTieCard/);assert.match(source,/decidedBy/);assert.match(source,/championsData\.phase==="knockout"/);assert.match(centre,/data-champions-view="knockout"/);assert.match(css,/\.knockout-legs/);assert.match(css,/grid-template-columns:1fr;overflow:visible/);});

test("la personalización reconoce equipos de Liga y Champions",()=>{const source=fs.readFileSync("preferences.js","utf8"),home=fs.readFileSync("home.js","utf8");assert.match(source,/TEAM_ALIASES/);assert.match(source,/championsTeams/);assert.match(source,/competition:"champions"/);assert.match(source,/window\.isFavouriteTeam/);assert.match(source,/únicamente en este dispositivo/);assert.match(home,/isFavouriteTeam/);});

test("todos los deportes respetan la zona horaria elegida",()=>{for(const path of ["home.js","football.js","champions.js","f1calendar.js","motogpcalendar.js"]){const source=fs.readFileSync(path,"utf8");assert.match(source,/WolfTimezone\?\.get\(\)|WolfTimezone\.get\(\)/,path+" no usa la zona elegida");}const site=fs.readFileSync("site.js","utf8");assert.match(site,/America\/Santiago/);assert.match(site,/America\/Santo_Domingo/);assert.match(site,/optgroup label/);assert.match(site,/Actual:/);});

test("la portada inteligente reúne y prioriza todos los eventos",()=>{const source=fs.readFileSync("home.js","utf8"),html=fs.readFileSync("index.html","utf8");assert.match(source,/officialChampionsFixtures/);assert.match(source,/eventPriority/);assert.match(source,/nextFavourite/);assert.match(source,/state==="live"\?500/);assert.match(source,/localDay/);assert.match(html,/home-priority-summary/);assert.match(html,/champions-fixtures\.js/);});

test("la PWA tiene manifiesto, iconos y pantalla sin conexión",()=>{
  const manifest=JSON.parse(fs.readFileSync("manifest.webmanifest","utf8"));
  assert.equal(manifest.start_url,"./?source=pwa");
  assert.equal(manifest.scope,"./");
  assert.equal(manifest.display,"standalone");
  for(const icon of manifest.icons){
    assert(fs.existsSync(icon.src),`falta ${icon.src}`);
    assert(fs.statSync(icon.src).size>1000,`${icon.src} está vacío`);
  }
  assert(fs.existsSync("offline.html"));
  assert.match(fs.readFileSync("index.html","utf8"),/rel="manifest" href="manifest\.webmanifest"/);
});

test("la caché nunca antepone datos deportivos a la red",()=>{
  const worker=fs.readFileSync("sw.js","utf8");
  assert.match(worker,/LIVE_DATA_FILES/);
  for(const file of ["sports-data.js","laliga-current.js","champions-data.js","f1calendar.js","motogpcalendar.js","home.js"]){
    assert.match(worker,new RegExp(file.replace(".","\\.")),file);
  }
  assert.match(worker,/fetch\(request,\{cache:"no-store"\}\)/);
  assert.match(worker,/request\.mode==="navigate"/);
  assert.match(worker,/offline\.html/);
});

test("todas las páginas activas cargan la misma versión PWA",()=>{
  const pages=["index.html","directos.html","deportes.html","F1.html","MotoGP.html","sobremi.html","status.html"];
  for(const page of pages){
    const html=fs.readFileSync(page,"utf8");
    assert.match(html,/site\.js\?v=20260914-performance1/,page);
    assert.match(html,/diseno\.css\?v=20260914-performance1/,page);
  }
  const site=fs.readFileSync("site.js","utf8");
  assert.match(site,/beforeinstallprompt/);
  assert.match(site,/serviceWorker\.register/);
  assert.match(site,/updateViaCache:"none"/);
});

test("la mejora de rendimiento evita descargas y trabajo innecesarios",()=>{
  const f1=fs.readFileSync("F1.html","utf8");
  assert.doesNotMatch(f1,/laliga-calendar\.js|sports-data\.js/);
  for(const path of ["home.js","football.js"]){
    const source=fs.readFileSync(path,"utf8");
    assert.match(source,/method:"HEAD"/,`${path} no usa una comprobación ligera`);
    assert.doesNotMatch(source,/response\.text\(\)/,`${path} vuelve a descargar los resultados`);
  }
  const particles=fs.readFileSync("particles.js","utf8");
  assert.match(particles,/saveData/);
  assert.match(particles,/now-lastFrame<33/);
  assert.match(particles,/requestIdleCallback/);
  for(const path of ["home.js","football.js","champions.js","f1calendar.js"]){
    assert.match(fs.readFileSync(path,"utf8"),/document\.hidden/,`${path} sigue trabajando en segundo plano`);
  }
});

test("la jornada 6 incluye todos los partidos oficiales del 15 de septiembre",()=>{
  const data=loadFootball();
  const matches=data.laligaRounds[6]||[];
  const day15=matches.filter(match=>match.iso?.startsWith("2026-09-15"));
  assert.equal(matches.length,10);
  assert.equal(JSON.stringify(day15.map(match=>[match.home,match.away,match.time])),JSON.stringify([
    ["Rayo Vallecano","RCD Espanyol de Barcelona","19:00"],
    ["Deportivo Alavés","Valencia CF","20:00"],
    ["Elche CF","Real Madrid","21:30"],
  ]));
  assert.equal(data.currentRound,6);
});

test("el sincronizador actualiza horarios oficiales y sus cachés",()=>{
  const updater=fs.readFileSync("scripts/update_laliga_results.py","utf8");
  const workflow=fs.readFileSync(".github/workflows/update-laliga-results.yml","utf8");
  assert.match(updater,/CALENDAR_FILE/);
  assert.match(updater,/schedule_patch/);
  assert.match(updater,/active_round - 1, active_round, active_round \+ 1/);
  assert.match(updater,/laliga-calendar\\\.js/);
  assert.match(workflow,/node --check laliga-calendar\.js/);
  assert.match(workflow,/git add -- sports-data\.js laliga-current\.js laliga-calendar\.js/);
});
