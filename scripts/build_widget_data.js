"use strict";

const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,"..");
const outputFile=path.join(root,"widget-data.json");
const siteBase="https://steven2506.github.io/CONTENIDO-DEPORTIVO/";
const now=Date.now();

function runData(files,resultExpression,extra={}){
  const sandbox={
    console:{info(){},warn(){},error(){}},
    setTimeout(){return 0;},clearTimeout(){},setInterval(){return 0;},clearInterval(){},
    localStorage:{getItem(){return null;},setItem(){}},
    document:{addEventListener(){},getElementById(){return null;},querySelector(){return null;},querySelectorAll(){return[];}},
    navigator:{},location:{href:siteBase},...extra
  };
  sandbox.window=sandbox;
  sandbox.globalThis=sandbox;
  const context=vm.createContext(sandbox);
  const source=files.map(file=>fs.readFileSync(path.join(root,file),"utf8")).join("\n");
  return vm.runInContext(`${source}\n;(${resultExpression})`,context,{timeout:5000});
}

function absoluteUrl(pathname){return new URL(pathname,siteBase).href;}
function localTime(value){
  return new Intl.DateTimeFormat("es-ES",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Madrid"}).format(new Date(value)).replace(/\.$/,"");
}

const events=[];
function addEvent({title,competition,start,href,status="scheduled",score=null}){
  const startAt=new Date(start).getTime();
  if(!Number.isFinite(startAt)||!title)return;
  if(status==="finished")return;
  if(status==="live"&&now-startAt>4*60*60*1000)return;
  if(status!=="live"&&startAt<now-20*60*1000)return;
  const live=status==="live";
  const scoreLabel=score?` · ${score}`:"";
  events.push({
    title:live&&score?`${title} · ${score}`:title,
    competition,
    startAt,
    href:absoluteUrl(href),
    status:live?"live":"scheduled",
    detail:`${competition} · ${live?"EN DIRECTO":localTime(start)}`,
    scoreLabel
  });
}

const football=runData(["laliga-calendar.js","sports-data.js"],"footballData");
for(const matches of Object.values(football.laligaRounds||{}))for(const match of matches||[]){
  const state=match.state==="live"?"live":match.state==="finished"||match.status==="Finalizado"?"finished":"scheduled";
  const score=Number.isInteger(match.homeScore)&&Number.isInteger(match.awayScore)?`${match.homeScore}–${match.awayScore}`:null;
  addEvent({title:score&&state==="live"?`${match.home} ${score} ${match.away}`:`${match.home} – ${match.away}`,competition:"LALIGA",start:match.iso,href:"deportes.html",status:state,score});
}

const champions=runData(["champions-data.js","champions-fixtures.js"],"officialChampionsFixtures");
for(const match of champions||[]){
  const state=match.state==="live"?"live":match.state==="finished"||match.status==="Finalizado"?"finished":"scheduled";
  const score=Number.isInteger(match.homeScore)&&Number.isInteger(match.awayScore)?`${match.homeScore}–${match.awayScore}`:null;
  const title=score&&state==="live"?`${match.home} ${score} ${match.away}`:`${match.home} – ${match.away}`;
  addEvent({title,competition:"CHAMPIONS",start:match.iso,href:"deportes.html",status:state,score});
}

const f1=runData(["f1-data.js"],"F1_CALENDAR");
for(const race of f1||[])for(const session of race.sessions||[]){
  const [sessionName,start]=session;
  addEvent({title:`${race.name} · ${sessionName}`,competition:"FÓRMULA 1",start,href:"F1.html"});
}

const moto=runData(["motogp-schedule-data.js","motogpcalendar.js"],"window.MotoGPSchedule.calendar");
for(const race of moto||[])for(const session of race.sessions||[]){
  addEvent({title:`${race.name} · ${session.name}`,competition:"MOTOGP",start:session.start,href:`motogp-gp.html?id=${encodeURIComponent(race.id)}`});
}

events.sort((a,b)=>(a.status==="live"?0:1)-(b.status==="live"?0:1)||a.startAt-b.startAt);
const selected=events.slice(0,3);
const liveCount=selected.filter(event=>event.status==="live").length;
const toRow=(event,index)=>({
  [`item${index+1}Title`]:event?.title||"",
  [`item${index+1}Detail`]:event?.detail||""
});
const data={
  headline:liveCount?`${liveCount} en directo`:"Próximas citas",
  headlineDetail:selected.length?"Fútbol, F1 y MotoGP · hora peninsular española":"No hay eventos confirmados próximamente",
  ...toRow(selected[0],0),
  ...toRow(selected[1],1),
  ...toRow(selected[2],2),
  url:selected[0]?.href||absoluteUrl("index.html")
};

const rendered=`${JSON.stringify(data,null,2)}\n`;
const previous=fs.existsSync(outputFile)?fs.readFileSync(outputFile,"utf8"):"";
if(previous!==rendered)fs.writeFileSync(outputFile,rendered,"utf8");
console.log(`Agenda de widget preparada · eventos visibles=${selected.length} · en directo=${liveCount}`);
