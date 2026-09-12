"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const test=require("node:test");

function loadFootball(){
  const context={}; context.globalThis=context; vm.createContext(context);
  vm.runInContext(fs.readFileSync("sports-data.js","utf8")+"\nglobalThis.__data=footballData;",context);
  vm.runInContext(fs.readFileSync("laliga-current.js","utf8"),context);
  return context.__data;
}
function loadFixtures(){
  const context={}; context.globalThis=context; vm.createContext(context);
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
