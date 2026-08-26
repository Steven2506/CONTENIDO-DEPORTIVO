function isFootballLive(match){
  if(match.state==="live")return true;
  if(!match.iso||match.state==="finished"||match.state==="postponed")return false;
  const elapsed=Date.now()-new Date(match.iso).getTime();
  return elapsed>=0&&elapsed<3*60*60*1000;
}
function spainDay(timestamp){return new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:"Europe/Madrid"}).format(new Date(timestamp));}

document.addEventListener("DOMContentLoaded", async () => {
  await window.f1Ready;
  const state=getF1State(),name=document.getElementById("f1-name"),place=document.getElementById("f1-circuit"),session=document.getElementById("f1-next-session"),timer=document.getElementById("f1-countdown");
  if(state.race){name.textContent=state.race.name;place.textContent=`📍 ${state.race.circuit}`;session.textContent=`${state.status==="live"?"🔴":"⏱️"} ${state.session[0]} · ${formatSpainTime(state.session[1])}`;renderSessionList(state.race);startCountdown(state.start,timer.id);}else{name.textContent="Temporada finalizada";timer.textContent="🏁";}
  const moto=getNextMotoGP(),mName=document.getElementById("motogp-name"),mPlace=document.getElementById("motogp-circuit"),mSession=document.getElementById("motogp-next-session"),mTimer=document.getElementById("motogp-countdown");if(moto){const nextMotoSession=getNextMotoSession(moto);mName.textContent=moto.name;mPlace.textContent=`📍 ${moto.circuit}`;if(mSession)mSession.textContent=nextMotoSession?`${motoSessionState(nextMotoSession)==="live"?"🔴":"⏱️"} ${nextMotoSession.name} · ${formatMotoSpainTime(nextMotoSession.start)}`:"Programa detallado pendiente";renderMotoSessionList(moto);startMotoCountdown(nextMotoSession?new Date(nextMotoSession.start).getTime():new Date(moto.date).getTime(),mTimer.id);}
  renderEventHub();
  setInterval(()=>{renderEventHub();checkHomeDataUpdate();},60000);
});
async function checkHomeDataUpdate(){try{const response=await fetch(`sports-data.js?poll=${Date.now()}`,{cache:"no-store"});if(!response.ok)return;const source=await response.text(),revision=source.match(/updated:"([^"]+)"/)?.[1];if(revision&&revision!==footballData.updated)location.reload();}catch(error){console.info("Sincronización temporalmente no disponible.");}}
function renderEventHub(){
  const box=document.getElementById("event-hub");
  if(!box)return;
  const f1=getF1State(),moto=getNextMotoGP(),events=[],motorEvents=[];
  if(f1.race)motorEvents.push({icon:"🏎️",title:`${f1.race.name} · ${f1.session[0]}`,time:f1.start,url:"F1.html"});
  if(moto)motorEvents.push({icon:"🏍️",title:moto.name,time:new Date(moto.date).getTime(),url:"MotoGP.html"});

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
