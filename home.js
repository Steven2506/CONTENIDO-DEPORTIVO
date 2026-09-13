function isFootballLive(match){
  if(match.state==="live"){
    if(!match.iso)return true;
    return Date.now()-new Date(match.iso).getTime()<150*60*1000;
  }
  if(!match.iso||match.state==="finished"||match.state==="postponed")return false;
  const elapsed=Date.now()-new Date(match.iso).getTime();
  return elapsed>=0&&elapsed<150*60*1000;
}
function localDay(timestamp){return new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:window.WolfTimezone?.get()||"Europe/Madrid"}).format(new Date(timestamp));}

let homeF1SessionKey="",homeMotoSessionKey="";
function homeMotoCountdown(ms){
  if(ms<=0)return "🔴 En curso";
  const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000);
  return d?`${d} d · ${h} h · ${m} min`:`${h} h · ${m} min · ${s} s`;
}
function renderHomeMotorCards(){
  const state=getF1State(),name=document.getElementById("f1-name"),place=document.getElementById("f1-circuit"),session=document.getElementById("f1-next-session"),timer=document.getElementById("f1-countdown");
  if(state.race){
    name.textContent=state.race.name;place.textContent=`📍 ${state.race.circuit}`;session.textContent=`${state.status==="live"?"🔴":"⏱️"} ${state.session[0]} · ${formatF1LocalTime(state.session[1])}`;timer.textContent=formatCountdown(state.start-Date.now());
    const key=`${state.race.round}|${state.session[0]}|${state.session[1]}`;if(key!==homeF1SessionKey){homeF1SessionKey=key;renderSessionList(state.race);}
  }else{name.textContent="Temporada finalizada";session.textContent="";timer.textContent="🏁";}
  const moto=getNextMotoGP(),mName=document.getElementById("motogp-name"),mPlace=document.getElementById("motogp-circuit"),mSession=document.getElementById("motogp-next-session"),mTimer=document.getElementById("motogp-countdown");
  if(moto){
    const nextMotoSession=getNextMotoSession(moto),target=nextMotoSession?new Date(nextMotoSession.start).getTime():new Date(moto.date).getTime();
    mName.textContent=moto.name;mPlace.textContent=`📍 ${moto.circuit}`;mSession.textContent=nextMotoSession?`${motoSessionState(nextMotoSession)==="live"?"🔴":"⏱️"} ${nextMotoSession.name} · ${formatMotoLocalTime(nextMotoSession.start)}`:"Programa detallado pendiente";mTimer.textContent=homeMotoCountdown(target-Date.now());
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
function homeFootballState(match){if(match.state==="finished"||match.status==="Finalizado")return "finished";return isFootballLive(match)?"live":match.state||"scheduled";}
function homeFootballEvent(match,competition){
  if(!match.iso)return null;const state=homeFootballState(match),hasScore=Number.isInteger(match.homeScore)&&Number.isInteger(match.awayScore),showScore=(state==="live"||state==="finished")&&hasScore;
  return {icon:"⚽",title:showScore?`${match.home} ${match.homeScore}–${match.awayScore} ${match.away}`:`${match.home} – ${match.away}`,time:new Date(match.iso).getTime(),url:"deportes.html",teams:`${match.home}|${match.away}`,state,competition};
}
function eventPriority(event,today){const favourite=event.teams?.split("|").some(team=>window.isFavouriteTeam?.(team));return (event.state==="live"?500:0)+(favourite?200:0)+(localDay(event.time)===today?100:0)+(event.state!=="finished"?20:0);}
function renderEventHub(){
  const box=document.getElementById("event-hub");if(!box)return;
  const f1=getF1State(),moto=getNextMotoGP(),events=[],motorEvents=[];
  if(f1.race)motorEvents.push({icon:"🏎️",title:`${f1.race.name} · ${f1.session[0]}`,time:f1.start,url:"F1.html",state:f1.status==="live"?"live":"scheduled",competition:"F1"});
  if(moto){const session=getNextMotoSession(moto);motorEvents.push({icon:"🏍️",title:session?`${moto.name} · ${session.name}`:moto.name,time:session?new Date(session.start).getTime():new Date(moto.date).getTime(),url:"MotoGP.html",state:session&&motoSessionState(session)==="live"?"live":"scheduled",competition:"MotoGP"});}
  Object.values(footballData.laligaRounds||{}).flat().forEach(match=>{const event=homeFootballEvent(match,"LALIGA");if(event)events.push(event);});
  if(typeof officialChampionsFixtures!=="undefined")officialChampionsFixtures.forEach(match=>{const event=homeFootballEvent(match,"Champions");if(event)events.push(event);});
  const today=localDay(Date.now()),favourite=window.getFavouriteTeam?.();
  const todayEvents=events.filter(event=>event.state==="live"||localDay(event.time)===today);
  const nextFavourite=favourite?events.filter(event=>event.state!=="finished"&&event.time>Date.now()&&event.teams?.split("|").some(team=>window.isFavouriteTeam?.(team))&&!todayEvents.includes(event)).sort((a,b)=>a.time-b.time)[0]:null;
  const visibleEvents=[...todayEvents,...(nextFavourite?[{...nextFavourite,isNextFavourite:true}]:[]),...motorEvents.filter(event=>Number.isFinite(event.time))].sort((a,b)=>eventPriority(b,today)-eventPriority(a,today)||a.time-b.time);
  const liveCount=visibleEvents.filter(event=>event.state==="live").length,todayCount=todayEvents.length;
  const summary=document.getElementById("home-priority-summary");if(summary)summary.innerHTML=`<span class="${liveCount?"active":""}">🔴 ${liveCount} en directo</span><span>📅 ${todayCount} hoy</span>${nextFavourite?'<span>★ Próximo de tu equipo</span>':""}`;
  const title=document.getElementById("event-hub-title");if(title)title.textContent=liveCount?"Ahora en directo":todayCount?"Hoy y próximamente":"Próximamente";
  box.innerHTML=visibleEvents.map(event=>{const finished=event.state==="finished",subtitle=finished?"Resultado definitivo":new Intl.DateTimeFormat("es-ES",{weekday:"long",day:"numeric",hour:"2-digit",minute:"2-digit",timeZone:window.WolfTimezone?.get()||"Europe/Madrid"}).format(new Date(event.time)),label=event.state==="live"?"🔴 EN JUEGO":finished?"FINAL":event.isNextFavourite?"TU PRÓXIMO":localDay(event.time)===today?"HOY":"PRÓXIMO";return `<a class="timeline-event${event.state==="live"?" is-live":""}${finished?" is-finished":""}" href="${event.url}"${event.teams?` data-teams="${event.teams}"`:""}><span>${event.icon}</span><span><strong>${event.title}</strong><small>${event.competition} · ${subtitle}</small></span><span class="event-state${event.state==="live"?" live":""}${finished?" finished":""}">${label}</span></a>`;}).join("")||'<div class="home-empty"><strong>Todo al día</strong><span>No hay eventos confirmados para hoy. Te mostramos las próximas sesiones en cuanto se publiquen.</span></div>';
  requestAnimationFrame(()=>window.applyTeamPreference?.());
}
