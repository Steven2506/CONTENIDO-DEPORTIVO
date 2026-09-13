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
