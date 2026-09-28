/* Motor F1 · consume exclusivamente f1-data.js para el calendario. */
const F1_SESSION_LENGTH = {"Libres 1":60,"Libres 2":60,"Libres 3":60,"Clasificación Sprint":50,"Sprint":60,"Clasificación":70,"Carrera":150};
let f1Races = F1_CALENDAR;
function f1SessionEnd(session){return new Date(session[1]).getTime()+(F1_SESSION_LENGTH[session[0]]||90)*60000;}
function f1SessionSourceStatus(session){const value=String(session[2]||"").toLowerCase();if(["live","in_progress","running"].includes(value))return "live";if(["final","finished","completed"].includes(value))return "finished";if(["postponed","cancelled","canceled"].includes(value))return value==="postponed"?"postponed":"cancelled";return "scheduled";}
function getF1SessionState(session,now=Date.now()){const start=new Date(session[1]).getTime(),end=f1SessionEnd(session),source=f1SessionSourceStatus(session);if(source==="live")return "live";if(source==="finished")return "finished";if(source==="postponed"||source==="cancelled")return source;if(now<start)return "upcoming";if(now<end)return "pending";return "finished";}
function getF1State(now=Date.now()){for(const race of f1Races){for(const session of race.sessions){const status=getF1SessionState(session,now);if(status==="live")return {race,session,status,start:new Date(session[1]).getTime(),end:f1SessionEnd(session)};if(status==="upcoming"||status==="pending")return {race,session,status,start:new Date(session[1]).getTime(),end:f1SessionEnd(session)};}}return {race:null,session:null,status:"finished"};}
function formatF1DateRange(race){const dates=race.sessions.map(s=>new Date(s[1])).sort((a,b)=>a-b);const first=dates[0],last=dates[dates.length-1];const fmt=new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"short",timeZone:"Europe/Madrid"});return `${fmt.format(first)} – ${fmt.format(last)}`;}
function formatCountdown(ms){if(ms<=0)return "🔴 En curso";const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000);return d?`${d} d · ${h} h · ${m} min`:`${h} h · ${m} min · ${s} s`;}
function formatF1LocalTime(iso){return new Intl.DateTimeFormat("es-ES",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:window.WolfTimezone?.get()||"Europe/Madrid"}).format(new Date(iso));}
function f1CalendarUrl(race,session){const stamp=date=>new Date(date).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z/,"Z"),start=new Date(session[1]),end=new Date(f1SessionEnd(session));return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${race.name} · ${session[0]}`)}&dates=${stamp(start)}/${stamp(end)}&location=${encodeURIComponent(race.circuit)}`;}
function startCountdown(time,id){const el=document.getElementById(id);if(!el)return;const update=()=>{if(!document.hidden)el.textContent=formatCountdown(time-Date.now());};update();setInterval(update,1000);document.addEventListener("visibilitychange",update);}
function renderSessionList(race,id="f1-sessions"){const box=document.getElementById(id);if(!box||!race)return;const now=Date.now();box.innerHTML=race.sessions.map(session=>{const start=new Date(session[1]).getTime(),end=f1SessionEnd(session);const state=getF1SessionState(session,now);const label={live:"En directo",finished:"Finalizada",upcoming:"Próxima",pending:"Pendiente",postponed:"Aplazada",cancelled:"Cancelada"}[state]||"Pendiente";return `<li class="session-row ${state==="live"?"is-live":""}"><span><strong>${session[0]}</strong><small>${formatF1LocalTime(session[1])}</small></span><span class="session-actions"><span class="status">${label}</span><a class="mini-action" href="${f1CalendarUrl(race,session)}" target="_blank" rel="noopener noreferrer" aria-label="Añadir ${session[0]} al calendario">＋ Calendario</a></span></li>`;}).join("");}
function renderF1Calendar(id="f1-calendar"){const box=document.getElementById(id);if(!box)return;const state=getF1State();box.innerHTML=f1Races.map(r=>{const isNext=state.race===r,past=r.sessions.every(s=>f1SessionEnd(s)<Date.now());return `<article class="race-card${past?" is-past":""}${isNext?" is-next":""}"><span class="race-round">ROUND ${r.round}</span>${isNext?'<span class="race-status">SIGUIENTE</span>':""}<h3>${r.name}</h3><p>${r.circuit}</p><p class="race-date">${formatF1DateRange(r)}</p></article>`;}).join("");}
async function loadF1Standings(){
  try{
    const response=await fetch("https://api.jolpi.ca/ergast/f1/2026/driverstandings.json",{cache:"no-store"});
    if(!response.ok)throw new Error("standings");
    const rows=(await response.json()).MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings||[];
    if(rows.length)return rows.slice(0,5).map(row=>({pos:Number(row.position),name:`${row.Driver.givenName} ${row.Driver.familyName}`,team:row.Constructors?.[0]?.name||"",points:Number(row.points)}));
  }catch(error){console.info("Clasificación F1 en modo de respaldo.");}
  return footballData.f1Standings;
}
window.f1Ready=Promise.resolve(f1Races);

function initF1Page(){
  const ready=window.f1Ready||Promise.resolve();
  ready.then(async()=>{
    renderF1Calendar();
    const state=getF1State();
    if(state.race){
      const title=document.getElementById("next-f1-title");
      if(title)title.textContent=state.race.name;
      renderSessionList(state.race,"next-f1-sessions");
      if(typeof renderRaceWeather==="function")renderRaceWeather(state.race);
    }
    const standings=await loadF1Standings();
    const box=document.getElementById("f1-standings");
    if(box)box.innerHTML=standings.map(d=>`<div class="standing-row"><b>${d.pos}</b><span><strong>${d.name}</strong><small>${d.team}</small></span><strong>${d.points} pts</strong></div>`).join("");
    const completed=[...f1Races].filter(r=>r.sessions.every(s=>f1SessionEnd(s)<=Date.now())).pop();
    const latest=document.getElementById("f1-latest-result");
    if(completed&&latest)latest.textContent=`${completed.name}: resultados oficiales disponibles en Formula1.com.`;
  });
}
document.addEventListener("DOMContentLoaded",initF1Page);
