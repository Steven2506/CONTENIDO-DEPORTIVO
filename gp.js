/* Ficha maestra reutilizable de Gran Premio. */
const GP_PENDING = "Datos oficiales pendientes";
const GP_STATE_LABEL = {live:"En curso",upcoming:"Próximo",pending:"Pendiente",finished:"Finalizado",postponed:"Aplazado",cancelled:"Cancelado"};
let gpCountdownRace=null,gpCountdownTimer=null;

function gpSetText(id,value){const node=document.getElementById(id);if(node)node.textContent=value;}
function gpWeekendState(race){
  const states=race.sessions.map(session=>getF1SessionState(session));
  if(states.includes("live")||states.includes("pending"))return "live";
  if(states.includes("upcoming"))return "upcoming";
  if(states.includes("postponed"))return "postponed";
  if(states.includes("cancelled"))return "cancelled";
  return "finished";
}
function gpRenderSessions(race){
  const tower=document.getElementById("gp-sessions"),results=document.getElementById("gp-results");
  const now=Date.now();
  tower.innerHTML=race.sessions.map((session,index)=>{
    const state=getF1SessionState(session,now),anchor=`gp-result-${index}`;
    return `<li class="gp-session ${state==="live"?"is-live":""}"><span class="gp-session-number">${String(index+1).padStart(2,"0")}</span><span class="gp-session-info"><strong>${session[0]}</strong><small>${formatF1LocalTime(session[1])}</small></span><span class="status">${GP_STATE_LABEL[state]||"Pendiente"}</span><a class="gp-result-link" href="#${anchor}">Resultados ↘</a></li>`;
  }).join("");
  results.innerHTML=race.sessions.map((session,index)=>`<article id="gp-result-${index}" class="gp-result-panel"><div><p class="eyebrow">${session[0]}</p><h3>Clasificación de sesión</h3></div><div class="gp-pending-panel"><strong>${GP_PENDING}</strong><span>La tabla se completará cuando esta sesión tenga resultados oficiales publicados.</span></div></article>`).join("");
}
function gpFindNextSession(race,now=Date.now()){
  const sessions=race.sessions.map(session=>({session,state:getF1SessionState(session,now)}));
  const upcoming=sessions.find(item=>item.state==="upcoming");
  if(upcoming)return upcoming;
  return sessions.find(item=>item.state==="live"||item.state==="pending")||null;
}
function gpCountdownTick(){
  if(document.hidden||!gpCountdownRace)return;
  const item=gpFindNextSession(gpCountdownRace),now=Date.now();
  if(!item){
    const anyPostponed=gpCountdownRace.sessions.some(session=>getF1SessionState(session,now)==="postponed");
    gpSetText("gp-countdown-session",anyPostponed?"Horario pendiente":"Fin de semana completado");
    gpSetText("gp-countdown-time",anyPostponed?"La organización todavía no ha confirmado el siguiente horario.":"No quedan sesiones programadas para este Gran Premio.");
    gpSetText("gp-countdown-state",anyPostponed?"HORARIO PENDIENTE":"COMPLETADO");
    ["days","hours","minutes","seconds"].forEach(unit=>gpSetText(`gp-count-${unit}`,"—"));
    return;
  }
  const session=item.session,start=new Date(session[1]).getTime(),isUpcoming=item.state==="upcoming";
  gpSetText("gp-countdown-session",session[0]);
  gpSetText("gp-countdown-time",isUpcoming?`Inicio previsto · ${formatF1LocalTime(session[1])}`:`Hora de finalización prevista · ${formatF1LocalTime(new Date(f1SessionEnd(session)).toISOString())}`);
  gpSetText("gp-countdown-state",isUpcoming?"PRÓXIMA":item.state==="live"?"EN DIRECTO":"EN CURSO · HORARIO PREVISTO");
  if(!isUpcoming){["days","hours","minutes","seconds"].forEach(unit=>gpSetText(`gp-count-${unit}`,"—"));return;}
  const total=Math.max(0,start-now),days=Math.floor(total/86400000),hours=Math.floor(total%86400000/3600000),minutes=Math.floor(total%3600000/60000),seconds=Math.floor(total%60000/1000);
  gpSetText("gp-count-days",String(days).padStart(2,"0"));
  gpSetText("gp-count-hours",String(hours).padStart(2,"0"));
  gpSetText("gp-count-minutes",String(minutes).padStart(2,"0"));
  gpSetText("gp-count-seconds",String(seconds).padStart(2,"0"));
}
function gpStartCountdown(race){
  gpCountdownRace=race;
  if(gpCountdownTimer)clearInterval(gpCountdownTimer);
  gpCountdownTick();
  gpCountdownTimer=setInterval(gpCountdownTick,1000);
  document.addEventListener("visibilitychange",gpCountdownTick);
}
function gpRender(race){
  const meta=F1_GP_META[race.round];
  if(!meta){gpSetText("gp-title","Gran Premio no encontrado");return;}
  const hero=document.getElementById("gp-hero");hero.style.setProperty("--gp-accent",meta.accent);
  document.title=`${race.name} · Fórmula 1 · WOLFGAMES`;
  gpSetText("gp-country",`${meta.flag} ${meta.country.toLocaleUpperCase("es-ES")}`);
  gpSetText("gp-title",race.name);
  gpSetText("gp-circuit-name",race.circuit);
  gpSetText("gp-round",String(race.round).padStart(2,"0"));
  gpSetText("gp-dates",formatF1DateRange(race));
  gpSetText("gp-status",GP_STATE_LABEL[gpWeekendState(race)]||"Pendiente");
  gpSetText("gp-location",meta.location||"Pendiente de confirmar con fuente oficial");
  gpRenderSessions(race);
  gpStartCountdown(race);
  document.getElementById("gp-race-data").innerHTML=["Ganador","Segundo","Tercero","Vuelta rápida","Vueltas","Abandonos","Safety car","Bandera roja","Pole position"].map((label,index)=>`<article class="gp-fact"><span class="gp-fact-index">${String(index+1).padStart(2,"0")}</span><small>${label}</small><strong>${GP_PENDING}</strong></article>`).join("");
  document.getElementById("gp-conditions").innerHTML=`<strong>${GP_PENDING}</strong><span>Temperaturas, humedad, viento y estado de pista aparecerán cuando haya una fuente oficial fiable.</span>`;
  document.getElementById("gp-championship").innerHTML=`<strong>${GP_PENDING}</strong><span>Clasificación de pilotos y constructores tras este GP.</span>`;
}
function initGrandPrixPage(){
  const requestedId=new URLSearchParams(window.location.search).get("id");
  const entry=Object.entries(F1_GP_META).find(([,meta])=>meta.id===requestedId);
  const race=entry&&F1_CALENDAR.find(item=>item.round===Number(entry[0]));
  if(race)gpRender(race);
  else {document.title="Gran Premio no encontrado · WOLFGAMES";gpSetText("gp-title","Gran Premio no encontrado");gpSetText("gp-country","No se reconoce esta ficha");gpSetText("gp-circuit-name","Elige un evento desde el calendario de Fórmula 1.");}
}
document.addEventListener("DOMContentLoaded",initGrandPrixPage);
