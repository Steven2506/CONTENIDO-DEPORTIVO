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
  const state=getF1State(),countdownState=getF1CountdownState(),name=document.getElementById("f1-name"),place=document.getElementById("f1-circuit"),session=document.getElementById("f1-next-session"),timer=document.getElementById("f1-countdown");
  if(state.race){
    name.textContent=state.race.name;place.textContent=`📍 ${state.race.circuit}`;session.textContent=`${countdownState.status==="live"?"🔴":"⏱️"} ${countdownState.session[0]} · ${formatF1LocalTime(countdownState.session[1])}`;
    timer.textContent=countdownState.status==="upcoming"?formatCountdown(countdownState.start-Date.now()):countdownState.status==="live"?"🔴 EN DIRECTO":"SESIÓN EN CURSO · HORARIO PREVISTO";
    const key=`${state.race.round}|${state.session[0]}|${state.session[1]}`;if(key!==homeF1SessionKey){homeF1SessionKey=key;renderSessionList(state.race);}
  }else{name.textContent="Temporada finalizada";session.textContent="";timer.textContent="🏁";}
  const moto=getNextMotoGP(),mName=document.getElementById("motogp-name"),mPlace=document.getElementById("motogp-circuit"),mSession=document.getElementById("motogp-next-session"),mTimer=document.getElementById("motogp-countdown");
  if(moto){
    const nextMotoSession=getNextMotoSession(moto);
    mName.textContent=moto.name;mPlace.textContent=`📍 ${moto.circuit}`;mSession.textContent=nextMotoSession?`${motoSessionState(nextMotoSession)==="live"?"🔴":"⏱️"} ${nextMotoSession.name} · ${formatMotoLocalTime(nextMotoSession.start)}`:"Fechas confirmadas · sesiones pendientes";mTimer.textContent=nextMotoSession?homeMotoCountdown(new Date(nextMotoSession.start).getTime()-Date.now()):"HORARIOS PENDIENTES";
    const key=`${moto.round}|${nextMotoSession?.name||"pending"}|${nextMotoSession?.start||moto.date}`;if(key!==homeMotoSessionKey){homeMotoSessionKey=key;renderMotoSessionList(moto);}
  }else{mName.textContent="Temporada finalizada";mSession.textContent="";mTimer.textContent="🏁";}
}
document.addEventListener("DOMContentLoaded", async () => {
  await window.f1Ready;
  renderHomeMotorCards();
  renderEventHub();
  setInterval(()=>{if(!document.hidden)renderHomeMotorCards();},1000);
  setInterval(()=>{if(!document.hidden){renderEventHub();checkHomeDataUpdate();}},60000);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden){renderHomeMotorCards();renderEventHub();checkHomeDataUpdate();}});
});
async function checkHomeDataUpdate(){try{const response=await fetch("sports-data.js?version-check=1",{method:"HEAD",cache:"no-store"});if(!response.ok)return;const revision=response.headers.get("etag")||response.headers.get("last-modified");if(!revision)return;const key="wolf-sports-etag",previous=sessionStorage.getItem(key);sessionStorage.setItem(key,revision);if(previous&&previous!==revision)location.reload();}catch(error){console.info("Sincronización temporalmente no disponible.");}}
function homeFootballState(match){if(match.state==="finished"||match.status==="Finalizado")return "finished";return isFootballLive(match)?"live":match.state||"scheduled";}
function homeFootballEvent(match,competition){
  if(!match.iso)return null;const state=homeFootballState(match),hasScore=Number.isInteger(match.homeScore)&&Number.isInteger(match.awayScore),showScore=(state==="live"||state==="finished")&&hasScore;
  return {id:`${competition}-${match.id||match.iso}-${match.home}`,title:showScore?`${match.home} ${match.homeScore}–${match.awayScore} ${match.away}`:`${match.home} – ${match.away}`,startAt:new Date(match.iso).getTime(),href:"deportes.html",participants:[match.home,match.away],status:state};
}
function eventPriority(event,today){const favourite=event.teams?.split("|").some(team=>window.isFavouriteTeam?.(team));return (event.state==="live"?500:0)+(favourite?200:0)+(localDay(event.time)===today?100:0)+(event.state!=="finished"?20:0);}
let homeSportsProvidersRegistered=false;
function registerHomeSportsProviders(){if(homeSportsProvidersRegistered||!window.SportsWidget)return;homeSportsProvidersRegistered=true;
  SportsWidget.register({id:"laliga",label:"LaLiga",icon:"⚽",url:"deportes.html",getEvents:()=>Object.values(footballData.laligaRounds||{}).flat().map(match=>homeFootballEvent(match,"laliga")).filter(Boolean)});
  SportsWidget.register({id:"champions",label:"Champions",icon:"🏆",url:"deportes.html",getEvents:()=>typeof officialChampionsFixtures!=="undefined"?officialChampionsFixtures.map(match=>homeFootballEvent(match,"champions")).filter(Boolean):[]});
  SportsWidget.register({id:"f1",label:"F1",icon:"🏎️",url:"F1.html",getEvents:()=>{const state=getF1CountdownState();return state.race?[{id:`f1-${state.race.round}-${state.session[0]}`,title:`${state.race.name} · ${state.session[0]}`,startAt:state.start,status:state.status==="live"?"live":"scheduled",href:`gp.html?id=${encodeURIComponent(F1_GP_META[state.race.round]?.id||"")}`}]:[];}});
  SportsWidget.register({id:"motogp",label:"MotoGP",icon:"🏍️",url:"MotoGP.html",getEvents:()=>{const race=getNextMotoGP();if(!race)return[];const session=getNextMotoSession(race);return[{id:`motogp-${race.id}-${session?.name||"gp"}`,title:session?`${race.name} · ${session.name}`:`${race.name} · programa pendiente`,startAt:session?new Date(session.start).getTime():new Date(race.date).getTime(),status:session?(motoSessionState(session)==="live"?"live":"scheduled"):"pending",href:`motogp-gp.html?id=${encodeURIComponent(race.id)}`}];}});
}
function renderEventHub(){
  const box=document.getElementById("event-hub");if(!box)return;
  registerHomeSportsProviders();const events=(window.SportsWidget?.events(Date.now())||[]).map(event=>({icon:event.icon,title:event.title,time:event.startAt,url:event.href,teams:event.participants.join("|"),state:event.status,competition:event.competitionLabel}));
  const today=localDay(Date.now()),favourite=window.getFavouriteTeam?.();
  const todayEvents=events.filter(event=>event.state==="live"||localDay(event.time)===today);
  const upcomingByCompetition=[...new Map(events.filter(event=>event.state!=="finished"&&event.time>Date.now()&&!todayEvents.includes(event)).sort((a,b)=>a.time-b.time).map(event=>[event.competition,event])).values()];
  const nextFavourite=favourite?events.filter(event=>event.state!=="finished"&&event.time>Date.now()&&event.teams?.split("|").some(team=>window.isFavouriteTeam?.(team))&&!todayEvents.includes(event)).sort((a,b)=>a.time-b.time)[0]:null;
  const visibleEvents=[...todayEvents,...(nextFavourite?[{...nextFavourite,isNextFavourite:true}]:[]),...upcomingByCompetition].sort((a,b)=>eventPriority(b,today)-eventPriority(a,today)||a.time-b.time);
  const liveCount=visibleEvents.filter(event=>event.state==="live").length,todayCount=todayEvents.length;
  const summary=document.getElementById("home-priority-summary");if(summary)summary.innerHTML=`<span class="${liveCount?"active":""}">🔴 ${liveCount} en directo</span><span>📅 ${todayCount} hoy</span>${nextFavourite?'<span>★ Próximo de tu equipo</span>':""}`;
  const title=document.getElementById("event-hub-title");if(title)title.textContent=liveCount?"Ahora en directo":todayCount?"Hoy y próximamente":"Próximamente";
  box.innerHTML=visibleEvents.map(event=>{const finished=event.state==="finished",subtitle=finished?"Resultado definitivo":new Intl.DateTimeFormat("es-ES",{weekday:"long",day:"numeric",hour:"2-digit",minute:"2-digit",timeZone:window.WolfTimezone?.get()||"Europe/Madrid"}).format(new Date(event.time)),label=event.state==="live"?"🔴 EN JUEGO":finished?"FINAL":event.isNextFavourite?"TU PRÓXIMO":localDay(event.time)===today?"HOY":"PRÓXIMO";return `<a class="timeline-event${event.state==="live"?" is-live":""}${finished?" is-finished":""}" href="${event.url}"${event.teams?` data-teams="${event.teams}"`:""}><span>${event.icon}</span><span><strong>${event.title}</strong><small>${event.competition} · ${subtitle}</small></span><span class="event-state${event.state==="live"?" live":""}${finished?" finished":""}">${label}</span></a>`;}).join("")||'<div class="home-empty"><strong>Todo al día</strong><span>No hay eventos confirmados para hoy. Te mostramos las próximas sesiones en cuanto se publiquen.</span></div>';
  requestAnimationFrame(()=>window.applyTeamPreference?.());
}

