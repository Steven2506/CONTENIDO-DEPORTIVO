function isFootballLive(match){
  if(match.state==="live")return true;
  if(!match.iso||match.state==="finished"||match.state==="postponed")return false;
  const elapsed=Date.now()-new Date(match.iso).getTime();
  return elapsed>=0&&elapsed<3*60*60*1000;
}
function spainDay(timestamp){return new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:"Europe/Madrid"}).format(new Date(timestamp));}

let homeF1SessionKey="",homeMotoSessionKey="";
function homeMotoCountdown(ms){
  if(ms<=0)return "🔴 En curso";
  const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000);
  return d?`${d} d · ${h} h · ${m} min`:`${h} h · ${m} min · ${s} s`;
}
function renderHomeMotorCards(){
  const state=getF1State(),name=document.getElementById("f1-name"),place=document.getElementById("f1-circuit"),session=document.getElementById("f1-next-session"),timer=document.getElementById("f1-countdown");
  if(state.race){
    name.textContent=state.race.name;place.textContent=`📍 ${state.race.circuit}`;session.textContent=`${state.status==="live"?"🔴":"⏱️"} ${state.session[0]} · ${formatSpainTime(state.session[1])}`;timer.textContent=formatCountdown(state.start-Date.now());
    const key=`${state.race.round}|${state.session[0]}|${state.session[1]}`;if(key!==homeF1SessionKey){homeF1SessionKey=key;renderSessionList(state.race);}
  }else{name.textContent="Temporada finalizada";session.textContent="";timer.textContent="🏁";}
  const moto=getNextMotoGP(),mName=document.getElementById("motogp-name"),mPlace=document.getElementById("motogp-circuit"),mSession=document.getElementById("motogp-next-session"),mTimer=document.getElementById("motogp-countdown");
  if(moto){
    const nextMotoSession=getNextMotoSession(moto),target=nextMotoSession?new Date(nextMotoSession.start).getTime():new Date(moto.date).getTime();
    mName.textContent=moto.name;mPlace.textContent=`📍 ${moto.circuit}`;mSession.textContent=nextMotoSession?`${motoSessionState(nextMotoSession)==="live"?"🔴":"⏱️"} ${nextMotoSession.name} · ${formatMotoSpainTime(nextMotoSession.start)}`:"Programa detallado pendiente";mTimer.textContent=homeMotoCountdown(target-Date.now());
    const key=`${moto.round}|${nextMotoSession?.name||"pending"}|${nextMotoSession?.start||moto.date}`;if(key!==homeMotoSessionKey){homeMotoSessionKey=key;renderMotoSessionList(moto);}
  }else{mName.textContent="Temporada finalizada";mSession.textContent="";mTimer.textContent="🏁";}
}
document.addEventListener("DOMContentLoaded", async () => {
  await window.f1Ready;
  renderHomeMotorCards();
  renderEventHub();
  setInterval(renderHomeMotorCards,1000);
  setInterval(()=>{renderEventHub();checkHomeDataUpdate();},60000);
});
async function checkHomeDataUpdate(){try{const response=await fetch(`sports-data.js?poll=${Date.now()}`,{cache:"no-store"});if(!response.ok)return;const source=await response.text(),revision=source.match(/updated:"([^"]+)"/)?.[1];if(revision&&revision!==footballData.updated)location.reload();}catch(error){console.info("Sincronización temporalmente no disponible.");}}
function renderEventHub(){
  const box=document.getElementById("event-hub");
  if(!box)return;
  const f1=getF1State(),moto=getNextMotoGP(),events=[],motorEvents=[];
  if(f1.race)motorEvents.push({icon:"🏎️",title:`${f1.race.name} · ${f1.session[0]}`,time:f1.start,url:"F1.html"});
  if(moto){const nextMotoSession=getNextMotoSession(moto);motorEvents.push({icon:"🏍️",title:nextMotoSession?`${moto.name} · ${nextMotoSession.name}`:moto.name,time:nextMotoSession?new Date(nextMotoSession.start).getTime():new Date(moto.date).getTime(),url:"MotoGP.html"});}

  Object.values(footballData.laligaRounds||{}).flat().forEach(match=>{
    if(!match.iso)return;
    const live=isFootballLive(match),finished=match.state==="finished"||match.status==="Finalizado",hasScore=Number.isInteger(match.homeScore)&&Number.isInteger(match.awayScore),showScore=(live||finished)&&hasScore;
    events.push({icon:"⚽",title:showScore?`${match.home} ${match.homeScore}–${match.awayScore} ${match.away}`:`${match.home} – ${match.away}`,time:new Date(match.iso).getTime(),url:"deportes.html",teams:`${match.home}|${match.away}`,state:live?"live":finished?"finished":match.state});
  });

  const favourite=window.getFavouriteTeam?.(),today=spainDay(Date.now());
  const footballEvents=events.filter(e=>Number.isFinite(e.time)&&(e.state==="live"||spainDay(e.time)===today)).sort((a,b)=>{const af=favourite&&a.teams?.split("|").includes(favourite),bf=favourite&&b.teams?.split("|").includes(favourite);return (b.state==="live")-(a.state==="live")||bf-af||a.time-b.time;});
  const visibleEvents=[...footballEvents,...motorEvents.filter(e=>Number.isFinite(e.time))];
  box.innerHTML=visibleEvents.map(e=>{const finished=e.state==="finished",subtitle=finished?"Resultado definitivo":new Intl.DateTimeFormat("es-ES",{weekday:"long",day:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Madrid"}).format(new Date(e.time)),label=e.state==="live"?"🔴 EN JUEGO":finished?"FINAL":spainDay(e.time)===today?"HOY":"PRÓXIMO";return `<a class="timeline-event${e.state==="live"?" is-live":""}${finished?" is-finished":""}" href="${e.url}"${e.teams?` data-teams="${e.teams}"`:""}><span>${e.icon}</span><span><strong>${e.title}</strong><small>${subtitle}</small></span><span class="event-state${e.state==="live"?" live":""}${finished?" finished":""}">${label}</span></a>`;}).join("")||"<p>No hay eventos próximos confirmados.</p>";
  requestAnimationFrame(()=>window.applyTeamPreference?.());
}
