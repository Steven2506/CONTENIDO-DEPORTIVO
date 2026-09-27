/* Motor F1 · consume exclusivamente f1-data.js para el calendario. */
const F1_SESSION_LENGTH = {"Libres 1":60,"Libres 2":60,"Libres 3":60,"Clasificación Sprint":50,"Sprint":60,"Clasificación":70,"Carrera":150};
let f1Races = F1_CALENDAR;
function f1SessionEnd(session){return new Date(session[1]).getTime()+(F1_SESSION_LENGTH[session[0]]||90)*60000;}
function getF1State(now=Date.now()){for(const race of f1Races){const next=race.sessions.find(session=>f1SessionEnd(session)>now);if(next){const start=new Date(next[1]).getTime(),end=f1SessionEnd(next);return {race,session:next,status:now>=start&&now<end?"live":"upcoming",start,end};}}return {race:null,session:null,status:"finished"};}
function formatF1DateRange(race){const dates=race.sessions.map(s=>new Date(s[1])).sort((a,b)=>a-b);const first=dates[0],last=dates[dates.length-1];const fmt=new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"short",timeZone:"Europe/Madrid"});return `${fmt.format(first)} – ${fmt.format(last)}`;}
function formatCountdown(ms){if(ms<=0)return "🔴 En curso";const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000);return d?`${d} d · ${h} h · ${m} min`:`${h} h · ${m} min · ${s} s`;}
function formatF1LocalTime(iso){return new Intl.DateTimeFormat("es-ES",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:window.WolfTimezone?.get()||"Europe/Madrid"}).format(new Date(iso));}
function f1CalendarUrl(race,session){const stamp=date=>new Date(date).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z/,"Z"),start=new Date(session[1]),end=new Date(f1SessionEnd(session));return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${race.name} · ${session[0]}`)}&dates=${stamp(start)}/${stamp(end)}&location=${encodeURIComponent(race.circuit)}`;}
function startCountdown(time,id){const el=document.getElementById(id);if(!el)return;const update=()=>{if(!document.hidden)el.textContent=formatCountdown(time-Date.now());};update();setInterval(update,1000);document.addEventListener("visibilitychange",update);}
function renderSessionList(race,id="f1-sessions"){const box=document.getElementById(id);if(!box||!race)return;const now=Date.now();box.innerHTML=race.sessions.map(session=>{const start=new Date(session[1]).getTime(),end=f1SessionEnd(session);const state=now>=start&&now<end?"En curso":end<=now?"Finalizada":"Próxima";return `<li class="session-row ${state==="En curso"?"is-live":""}"><span><strong>${session[0]}</strong><small>${formatF1LocalTime(session[1])}</small></span><span class="session-actions"><span class="status">${state}</span><a class="mini-action" href="${f1CalendarUrl(race,session)}" target="_blank" rel="noopener noreferrer" aria-label="Añadir ${session[0]} al calendario">＋ Calendario</a></span></li>`;}).join("");}
function renderF1Calendar(id="f1-calendar"){const box=document.getElementById(id);if(!box)return;const state=getF1State();box.innerHTML=f1Races.map(r=>{const isNext=state.race===r,past=r.sessions.every(s=>f1SessionEnd(s)<Date.now());return `<${tag}${href} class="race-card${past?" is-past":""}${isNext?" is-next":""}"><span class="race-round">ROUND ${r.round}</span>${isNext?'<span class="race-status">SIGUIENTE</span>':""}<h3>${r.name}</h3><p>${r.circuit}</p><p class="race-date">${formatF1DateRange(r)}</p></${tag}>`;}).join("");}
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
