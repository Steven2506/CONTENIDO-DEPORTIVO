/* Ficha maestra reutilizable de Gran Premio. */
const GP_PENDING = "Pendiente de publicación";
const GP_STATE_LABEL = {live:"En curso",upcoming:"Próximo",pending:"Pendiente",finished:"Finalizado",postponed:"Aplazado",cancelled:"Cancelado"};
const GP_API_ROOT="https://api.jolpi.ca/ergast/f1";
let gpCountdownRace=null,gpCountdownTimer=null;

function gpSetText(id,value){const node=document.getElementById(id);if(node)node.textContent=value;}
function gpEscape(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));}
async function gpFetch(path){const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),9000);try{const response=await fetch(`${GP_API_ROOT}/${path}.json?limit=100`,{cache:"no-store",signal:controller.signal});if(!response.ok)throw new Error(`F1 data request failed (${response.status})`);return (await response.json()).MRData||{};}finally{clearTimeout(timeout);}}
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
  results.innerHTML=race.sessions.map((session,index)=>{const available=Boolean(gpSessionEndpoint(session));return `<article id="gp-result-${index}" class="gp-result-panel"><div><p class="eyebrow">${gpEscape(session[0])}</p><h3>Clasificación de sesión</h3></div><div class="gp-pending-panel"><strong>${available?"Consultando resultados…":GP_PENDING}</strong><span>${gpEscape(available?"Comprobando si la fuente ya publicó esta sesión.":gpSessionPendingMessage(session))}</span></div></article>`;}).join("");
  gpLoadResults(race);
}
function gpPendingPanel(message,title=GP_PENDING){return `<div class="gp-pending-panel"><strong>${gpEscape(title)}</strong><span>${gpEscape(message)}</span></div>`;}
function gpSessionPendingMessage(session){const name=String(session[0]).toLowerCase();if(name.startsWith("libres"))return "La fuente consultada no publica clasificaciones de entrenamientos libres.";if(name.includes("sprint")&&name.includes("clasificación"))return "La clasificación sprint no está disponible en esta fuente de resultados.";return "Se mostrará cuando exista una clasificación publicada para esta sesión.";}
function gpResultTable(rows,type){
  if(!rows?.length)return gpPendingPanel("La fuente todavía no ha publicado la clasificación de esta sesión.");
  const qualifying=type==="qualifying";
  const body=rows.map(row=>{
    const driver=row.Driver||{},team=row.Constructor||{};
    const result=qualifying?[row.Q3,row.Q2,row.Q1].find(Boolean)||"—":row.Time?.time||row.status||"—";
    const extra=qualifying?"":`${row.laps?`${row.laps} v`:"—"} · ${row.points??"0"} pts`;
    return `<tr><td>${gpEscape(row.position||row.positionText||"—")}</td><td><strong>${gpEscape(`${driver.givenName||""} ${driver.familyName||""}`.trim()||"Piloto")}</strong><small>${gpEscape(driver.code||"")}</small></td><td>${gpEscape(team.name||"—")}</td><td>${gpEscape(result)}</td>${qualifying?"":`<td>${gpEscape(extra)}</td>`}</tr>`;
  }).join("");
  return `<div class="gp-table-wrap"><table class="gp-classification"><thead><tr><th>POS</th><th>PILOTO</th><th>EQUIPO</th><th>${qualifying?"TIEMPO":"TIEMPO / ESTADO"}</th>${qualifying?"":"<th>VUELTAS · PTS</th>"}</tr></thead><tbody>${body}</tbody></table></div>`;
}
function gpSessionEndpoint(session){
  const name=String(session[0]).toLowerCase();
  if(name==="carrera")return "results";
  if(name==="sprint")return "sprint";
  if(name==="clasificación")return "qualifying";
  return null;
}
function gpRenderRaceFacts(results,qualifying,pendingState=GP_PENDING){
  const sorted=results.slice().sort((a,b)=>Number(a.position)-Number(b.position));
  const podium=sorted.filter(row=>["1","2","3"].includes(row.position));
  const fastest=sorted.find(row=>row.FastestLap?.rank==="1");
  const dnf=sorted.filter(row=>!/^\d+$/.test(String(row.positionText||""))).length;
  const pole=qualifying.slice().sort((a,b)=>Number(a.position)-Number(b.position))[0];
  const laps=sorted[0]?.laps;
  const data=[
    ["Ganador",podium[0]?.Driver?`${podium[0].Driver.givenName} ${podium[0].Driver.familyName}`:pendingState],
    ["Segundo",podium[1]?.Driver?`${podium[1].Driver.givenName} ${podium[1].Driver.familyName}`:pendingState],
    ["Tercero",podium[2]?.Driver?`${podium[2].Driver.givenName} ${podium[2].Driver.familyName}`:pendingState],
    ["Vuelta rápida",fastest?.Driver?`${fastest.Driver.code||fastest.Driver.familyName} · ${fastest.FastestLap.Time?.time||"tiempo pendiente"}`:pendingState],
    ["Vueltas",laps||pendingState],
    ["No clasificados",results.length?dnf:pendingState],
    ["Safety car",GP_PENDING],
    ["Bandera roja",GP_PENDING],
    ["Pole position",pole?.Driver?`${pole.Driver.givenName} ${pole.Driver.familyName}`:pendingState]
  ];
  document.getElementById("gp-race-data").innerHTML=data.map(([label,value],index)=>`<article class="gp-fact"><span class="gp-fact-index">${String(index+1).padStart(2,"0")}</span><small>${gpEscape(label)}</small><strong>${gpEscape(value)}</strong></article>`).join("");
}
function gpRenderStandings(kind,rows){
  if(!rows?.length)return gpPendingPanel("La clasificación del campeonato para esta ronda aún no está publicada.");
  const isDriver=kind==="drivers";
  return `<div class="gp-championship-block"><h3>${isDriver?"Pilotos":"Constructores"}</h3><ol>${rows.slice(0,5).map(row=>{const name=isDriver?`${row.Driver?.givenName||""} ${row.Driver?.familyName||""}`.trim():row.Constructor?.name||"—";return `<li><b>${gpEscape(row.position||"—")}</b><span>${gpEscape(name)}</span><strong>${gpEscape(row.points||"0")} pts</strong></li>`;}).join("")}</ol></div>`;
}
async function gpLoadResults(race){
  const resultsBox=document.getElementById("gp-results");
  const settled=await Promise.all(race.sessions.map(async(session,index)=>{
    const type=gpSessionEndpoint(session);
    if(!type)return {index,type:null,rows:[]};
    try{
      const data=await gpFetch(`2026/${race.round}/${type}`);
      const apiRace=data.RaceTable?.Races?.[0];
      const key=type==="qualifying"?"QualifyingResults":type==="sprint"?"SprintResults":"Results";
      return {index,type,rows:apiRace?.[key]||[],failed:false};
    }catch(error){return {index,type,rows:[],failed:true};}
  }));
  settled.forEach(({index,type,rows,failed})=>{
    if(!type)return;
    const raceTable=resultsBox.querySelector(`#gp-result-${index} .gp-pending-panel`);
    if(!raceTable)return;
    raceTable.outerHTML=failed?gpPendingPanel("No se pudo conectar con la fuente de resultados. Inténtalo de nuevo más tarde.","Fuente no disponible"):gpResultTable(rows,type);
  });
  const raceRequest=settled.find(item=>item.type==="results"),raceResult=raceRequest?.rows||[];
  const qualiResult=settled.find(item=>item.type==="qualifying")?.rows||[];
  gpRenderRaceFacts(raceResult,qualiResult,raceRequest?.failed?"Fuente no disponible":GP_PENDING);
  const championship=document.getElementById("gp-championship");
  if(!raceResult.length){championship.innerHTML=gpPendingPanel(raceRequest?.failed?"No se pudo conectar con la fuente de clasificación.":"Pilotos y constructores se actualizarán cuando se publiquen los resultados de este GP.",raceRequest?.failed?"Fuente no disponible":GP_PENDING);return;}
  const [drivers,constructors]=await Promise.allSettled([gpFetch(`2026/${race.round}/driverstandings`),gpFetch(`2026/${race.round}/constructorstandings`)]);
  const driverRows=drivers.status==="fulfilled"?drivers.value.StandingsTable?.StandingsLists?.[0]?.DriverStandings||[]:[];
  const constructorRows=constructors.status==="fulfilled"?constructors.value.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings||[]:[];
  const driverPanel=drivers.status==="rejected"?gpPendingPanel("No se pudo conectar con la fuente de clasificación.","Fuente no disponible"):gpRenderStandings("drivers",driverRows);
  const constructorPanel=constructors.status==="rejected"?gpPendingPanel("No se pudo conectar con la fuente de clasificación.","Fuente no disponible"):gpRenderStandings("constructors",constructorRows);
  championship.innerHTML=`<div class="gp-championship-grid">${driverPanel}${constructorPanel}</div>`;
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
  document.getElementById("gp-race-data").innerHTML=["Ganador","Segundo","Tercero","Vuelta rápida","Vueltas","No clasificados","Safety car","Bandera roja","Pole position"].map((label,index)=>`<article class="gp-fact"><span class="gp-fact-index">${String(index+1).padStart(2,"0")}</span><small>${label}</small><strong>Consultando resultados…</strong></article>`).join("");
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
