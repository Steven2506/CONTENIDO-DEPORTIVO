/* Motor F1 · consume exclusivamente f1-data.js para el calendario. */
let f1Races = F1_CALENDAR;
function f1SessionEnd(session){return motorsportSessionEnd("f1",session);}
function getF1SessionState(session,now=Date.now()){return motorsportSessionState("f1",session,now);}
function getF1State(now=Date.now()){for(const race of f1Races){for(const session of race.sessions){const status=getF1SessionState(session,now);if(status==="live")return {race,session,status,start:new Date(session[1]).getTime(),end:f1SessionEnd(session)};if(status==="upcoming"||status==="pending")return {race,session,status,start:new Date(session[1]).getTime(),end:f1SessionEnd(session)};}}return {race:null,session:null,status:"finished"};}
function getF1CountdownState(now=Date.now()){
  const current=getF1State(now);
  if(current.race&&(current.status==="pending"||current.status==="live")){
    const firstNotEnded=current.race.sessions.find(session=>f1SessionEnd(session)>now);
    const scanFrom=firstNotEnded?current.race.sessions.indexOf(firstNotEnded):0;
    const next=current.race.sessions.slice(scanFrom).find(session=>getF1SessionState(session,now)==="upcoming");
    if(next)return {race:current.race,session:next,status:"upcoming",start:new Date(next[1]).getTime(),end:f1SessionEnd(next)};
  }
  return current;
}
function formatF1DateRange(race){const dates=race.sessions.map(s=>new Date(s[1])).sort((a,b)=>a-b);const first=dates[0],last=dates[dates.length-1];const fmt=new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"short",timeZone:"Europe/Madrid"});return `${fmt.format(first)} – ${fmt.format(last)}`;}
function formatCountdown(ms){if(ms<=0)return "🔴 En curso";const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000);return d?`${d} d · ${h} h · ${m} min`:`${h} h · ${m} min · ${s} s`;}
function formatF1LocalTime(iso){return new Intl.DateTimeFormat("es-ES",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:window.WolfTimezone?.get()||"Europe/Madrid"}).format(new Date(iso));}
function f1CalendarUrl(race,session){const stamp=date=>new Date(date).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z/,"Z"),start=new Date(session[1]),end=new Date(f1SessionEnd(session));return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${race.name} · ${session[0]}`)}&dates=${stamp(start)}/${stamp(end)}&location=${encodeURIComponent(race.circuit)}`;}
function startCountdown(time,id){const el=document.getElementById(id);if(!el)return;const update=()=>{if(!document.hidden)el.textContent=formatCountdown(time-Date.now());};update();setInterval(update,1000);document.addEventListener("visibilitychange",update);}
function renderSessionList(race,id="f1-sessions"){const box=document.getElementById(id);if(!box||!race)return;const now=Date.now();box.innerHTML=race.sessions.map(session=>{const start=new Date(session[1]).getTime(),end=f1SessionEnd(session);const state=getF1SessionState(session,now);const label={live:"En directo",finished:"Finalizada",upcoming:"Próxima",pending:"Pendiente",postponed:"Aplazada",cancelled:"Cancelada"}[state]||"Pendiente";return `<li class="session-row ${state==="live"?"is-live":""}"><span><strong>${session[0]}</strong><small>${formatF1LocalTime(session[1])}</small></span><span class="session-actions"><span class="status">${label}</span><a class="mini-action" href="${f1CalendarUrl(race,session)}" target="_blank" rel="noopener noreferrer" aria-label="Añadir ${session[0]} al calendario">＋ Calendario</a></span></li>`;}).join("");}
function renderF1Calendar(id="f1-calendar"){const box=document.getElementById(id);if(!box)return;const state=getF1State();box.innerHTML=f1Races.map(r=>{const isNext=state.race===r,past=r.sessions.every(s=>f1SessionEnd(s)<Date.now()),meta=F1_GP_META[r.round];return `<article class="race-card${past?" is-past":""}${isNext?" is-next":""}" style="--gp-accent:${meta.accent}"><span class="race-round">ROUND ${r.round}</span>${isNext?'<span class="race-status">SIGUIENTE</span>':""}<h3><a href="gp.html?id=${encodeURIComponent(meta.id)}">${r.name}</a></h3><p>${r.circuit}</p><p class="race-date">${formatF1DateRange(r)}</p><a class="race-open" href="gp.html?id=${encodeURIComponent(meta.id)}">Abrir ficha <span aria-hidden="true">↗</span></a></article>`;}).join("");}
function renderF1PageCountdown(){
  const timer=document.getElementById("next-f1-countdown"),note=document.getElementById("next-f1-countdown-note");
  if(!timer)return;
  const update=()=>{
    if(document.hidden)return;
    const state=getF1CountdownState(),now=Date.now();
    if(!state.race){timer.textContent="Temporada finalizada";if(note)note.textContent="No quedan sesiones programadas.";return;}
    const label=`${state.race.name} · ${state.session[0]} · ${formatF1LocalTime(state.session[1])}`;
    if(state.status==="upcoming"){
      timer.textContent=formatCountdown(state.start-now);
      if(note)note.textContent=`Cuenta atrás · ${label}`;
    }else if(state.status==="live"){
      timer.textContent="🔴 EN DIRECTO";
      if(note)note.textContent=`${label} · estado confirmado`;
    }else{
      timer.textContent="SESIÓN EN CURSO";
      if(note)note.textContent=`${label} · horario previsto; estado oficial pendiente`;
    }
  };
  update();
  setInterval(update,1000);
  document.addEventListener("visibilitychange",update);
}
const F1_API_ROOT="https://api.jolpi.ca/ergast/f1";
function f1Escape(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));}
async function fetchF1Api(path){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),9000);
  try{const response=await fetch(`${F1_API_ROOT}/${path}.json?limit=100`,{cache:"no-store",signal:controller.signal});if(!response.ok)throw new Error(`F1 data request failed (${response.status})`);return (await response.json()).MRData||{};}
  finally{clearTimeout(timeout);}
}
function f1DriverStanding(row){return {pos:Number(row.position),name:`${row.Driver?.givenName||""} ${row.Driver?.familyName||""}`.trim(),team:row.Constructors?.map(team=>team.name).filter(Boolean).join(" · ")||"",points:Number(row.points),wins:Number(row.wins)||0};}
function f1ConstructorStanding(row){return {pos:Number(row.position),name:row.Constructor?.name||"",points:Number(row.points),wins:Number(row.wins)||0};}
function renderF1Standings(boxId,rows,kind){
  const box=document.getElementById(boxId);if(!box)return;
  if(!rows?.length){box.innerHTML='<p class="f1-data-pending">Clasificación todavía no publicada por la fuente de datos.</p>';return;}
  box.innerHTML=rows.slice(0,5).map(row=>`<div class="standing-row"><b>${f1Escape(row.pos)}</b><span><strong>${f1Escape(row.name)}</strong><small>${f1Escape(kind==="drivers"?row.team||"Equipo pendiente":`${row.wins} ${row.wins===1?"victoria":"victorias"}`)}</small></span><strong>${f1Escape(row.points)} pts</strong></div>`).join("");
}
function initF1StandingsTabs(){
  const tabs=[...document.querySelectorAll("[data-f1-standings-tab]")];
  tabs.forEach((tab,index)=>tab.addEventListener("click",()=>{
    const kind=tab.dataset.f1StandingsTab;
    tabs.forEach(item=>{const selected=item===tab;item.setAttribute("aria-selected",String(selected));item.tabIndex=selected?0:-1;});
    document.getElementById("f1-panel-drivers").hidden=kind!=="drivers";
    document.getElementById("f1-panel-constructors").hidden=kind!=="constructors";
    const link=document.getElementById("f1-standings-link");
    if(link)link.href=`https://www.formula1.com/en/results/2026/${kind==="drivers"?"drivers":"team"}`;
  }));
  tabs.forEach((tab,index)=>tab.addEventListener("keydown",event=>{if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();tabs[(index+(event.key==="ArrowRight"?1:tabs.length-1))%tabs.length].click();tabs[(index+(event.key==="ArrowRight"?1:tabs.length-1))%tabs.length].focus();}}));
}
async function loadF1Standings(){
  const [drivers,constructors]=await Promise.allSettled([fetchF1Api("2026/driverstandings"),fetchF1Api("2026/constructorstandings")]);
  const driverRows=drivers.status==="fulfilled"?drivers.value.StandingsTable?.StandingsLists?.[0]?.DriverStandings||[]:[];
  const constructorRows=constructors.status==="fulfilled"?constructors.value.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings||[]:[];
  renderF1Standings("f1-driver-standings",driverRows.map(f1DriverStanding),"drivers");
  renderF1Standings("f1-constructor-standings",constructorRows.map(f1ConstructorStanding),"constructors");
}
function renderF1LatestRace(race){
  const box=document.getElementById("f1-latest-result");if(!box)return;
  const results=race?.Results||[];
  if(!results.length){box.innerHTML="<p>Los resultados de carrera todavía no están publicados.</p>";return;}
  const podium=results.filter(row=>["1","2","3"].includes(row.position)).sort((a,b)=>Number(a.position)-Number(b.position));
  const round=Number(race.round),gp=F1_GP_META[round];
  const date=race.date?new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(`${race.date}T00:00:00Z`)):"";
  const podiumMarkup=podium.map(row=>`<li><b>${f1Escape(row.position)}</b><span>${f1Escape(`${row.Driver?.givenName||""} ${row.Driver?.familyName||""}`.trim())}</span><small>${f1Escape(row.Constructor?.name||"")}</small></li>`).join("");
  const fastest=results.find(row=>row.FastestLap?.rank==="1");
  const href=gp?`gp.html?id=${encodeURIComponent(gp.id)}`:"https://www.formula1.com/en/results/2026/races";
  box.innerHTML=`<p class="f1-last-race-title">${f1Escape(race.raceName||"Gran Premio")}</p><p class="f1-last-race-date">${f1Escape(date)}</p>${podium.length?`<ol class="f1-result-podium">${podiumMarkup}</ol>`:`<p>Podio todavía pendiente de publicación.</p>`}<p class="f1-last-race-facts">${f1Escape(race.Results[0]?.laps?`${race.Results[0].laps} vueltas`:"Vueltas pendientes")}${fastest?` · Vuelta rápida: ${f1Escape(fastest.Driver?.code||fastest.Driver?.familyName)} (${f1Escape(fastest.FastestLap?.Time?.time||"tiempo pendiente")})`:" · Vuelta rápida pendiente"}</p><a class="f1-last-race-link" href="${href}">Abrir ficha del GP ↗</a>`;
}
async function loadF1LatestRace(){
  const box=document.getElementById("f1-latest-result");if(!box)return;
  const completed=f1Races.filter(race=>{const session=race.sessions.find(item=>item[0]==="Carrera");return session&&f1SessionEnd(session)<=Date.now();}).sort((a,b)=>b.round-a.round);
  for(const scheduled of completed){
    try{
      const data=await fetchF1Api(`2026/${scheduled.round}/results`);
      const race=(data.RaceTable?.Races||[]).find(item=>item.Results?.length);
      if(race){renderF1LatestRace(race);return;}
    }catch(error){continue;}
  }
  box.innerHTML='<p>Los resultados de carrera todavía no están publicados en la fuente de datos. Consulta el enlace oficial de F1.</p>';
}
window.f1Ready=Promise.resolve(f1Races);

function initF1Page(){
  if(!document.getElementById("f1-calendar"))return;
  const ready=window.f1Ready||Promise.resolve();
  ready.then(async()=>{
    renderF1Calendar();
    renderF1PageCountdown();
    const state=getF1State();
    if(state.race){
      const title=document.getElementById("next-f1-title");
      if(title)title.textContent=state.race.name;
      renderSessionList(state.race,"next-f1-sessions");
      if(typeof renderRaceWeather==="function")renderRaceWeather(state.race);
    }
    initF1StandingsTabs();
    await Promise.allSettled([loadF1Standings(),loadF1LatestRace()]);
  });
}
window.F1Schedule={competition:"f1",calendar:f1Races,getState:getF1State,getCountdownState:getF1CountdownState,sessionState:getF1SessionState,nextSession:(race,now=Date.now())=>motorsportNextSession("f1",race,now)};
document.addEventListener("DOMContentLoaded",initF1Page);
