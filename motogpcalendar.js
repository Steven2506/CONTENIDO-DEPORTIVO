const motogpCalendar = [
  ["GP Tailandia 🇹🇭","Chang International Circuit","2026-02-27T09:00:00+07:00","27 FEB–1 MAR"],
  ["GP Brasil 🇧🇷","Goiânia","2026-03-20T09:00:00-03:00","20–22 MAR"],
  ["GP Americas 🇺🇸","Circuit of the Americas","2026-03-27T09:00:00-05:00","27–29 MAR"],
  ["GP España 🇪🇸","Jerez","2026-04-24T09:00:00+02:00","24–26 ABR"],
  ["GP Francia 🇫🇷","Le Mans","2026-05-08T09:00:00+02:00","8–10 MAY"],
  ["GP Cataluña 🇪🇸","Barcelona","2026-05-15T09:00:00+02:00","15–17 MAY"],
  ["GP Italia 🇮🇹","Mugello","2026-05-29T09:00:00+02:00","29–31 MAY"],
  ["GP Hungría 🇭🇺","Balaton Park","2026-06-05T09:00:00+02:00","5–7 JUN"],
  ["GP Chequia 🇨🇿","Brno","2026-06-19T09:00:00+02:00","19–21 JUN"],
  ["GP Países Bajos 🇳🇱","Assen","2026-06-26T09:00:00+02:00","26–28 JUN"],
  ["GP Alemania 🇩🇪","Sachsenring","2026-07-10T09:00:00+02:00","10–12 JUL"],
  ["GP Gran Bretaña 🇬🇧","Silverstone","2026-08-07T09:00:00+01:00","7–9 AGO"],
  ["GP Aragón 🇪🇸","MotorLand Aragón","2026-08-28T09:00:00+02:00","28–30 AGO"],
  ["GP San Marino 🇸🇲","Misano","2026-09-11T09:00:00+02:00","11–13 SEP"],
  ["GP Austria 🇦🇹","Red Bull Ring","2026-09-18T09:00:00+02:00","18–20 SEP"],
  ["GP Japón 🇯🇵","Motegi","2026-10-02T09:00:00+09:00","2–4 OCT"],
  ["GP Indonesia 🇮🇩","Mandalika","2026-10-09T09:00:00+08:00","9–11 OCT"],
  ["GP Australia 🇦🇺","Phillip Island","2026-10-22T09:00:00+11:00","22–25 OCT"],
  ["GP Malasia 🇲🇾","Sepang","2026-10-30T09:00:00+08:00","30 OCT–1 NOV"],
  ["GP Qatar 🇶🇦","Lusail","2026-11-06T09:00:00+03:00","6–8 NOV"],
  ["GP Portugal 🇵🇹","Portimão","2026-11-20T09:00:00+00:00","20–22 NOV"],
  ["GP Valencia 🇪🇸","Ricardo Tormo","2026-11-27T09:00:00+01:00","27–29 NOV"]
].map(([name,circuit,date,label],i)=>({round:i+1,name,circuit,date,label}));
const aragonMotoGP=motogpCalendar.find(race=>race.round===13);
if(aragonMotoGP)aragonMotoGP.sessions=[
  ["FP1","2026-08-28T10:45:00+02:00",45],
  ["Practice","2026-08-28T15:00:00+02:00",60],
  ["FP2","2026-08-29T10:10:00+02:00",30],
  ["Clasificación (Q1/Q2)","2026-08-29T10:50:00+02:00",55],
  ["Sprint","2026-08-29T15:00:00+02:00",45],
  ["Warm Up","2026-08-30T09:40:00+02:00",20],
  ["Carrera","2026-08-30T14:00:00+02:00",90]
].map(([name,start,duration])=>({name,start,duration}));
function motoWeekendEnd(race){return new Date(new Date(race.date).getTime()+3*86400000).getTime();}
function getNextMotoGP(){return motogpCalendar.find(r=>motoWeekendEnd(r)>Date.now())||null;}
function getNextMotoSession(race){return race?.sessions?.find(session=>new Date(session.start).getTime()+session.duration*60000>Date.now())||null;}
function motoSessionState(session){const start=new Date(session.start).getTime(),end=start+session.duration*60000,now=Date.now();return now<start?"upcoming":now<=end?"live":"finished";}
function formatMotoSpainTime(value){return new Intl.DateTimeFormat("es-ES",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Madrid"}).format(new Date(value));}
function motoCalendarUrl(race){const compact=date=>date.toISOString().slice(0,10).replaceAll("-","");const start=new Date(race.date),end=new Date(motoWeekendEnd(race));return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${race.name} · MotoGP`)}&dates=${compact(start)}/${compact(end)}&location=${encodeURIComponent(race.circuit)}&details=${encodeURIComponent("Fin de semana de MotoGP · Consulta los horarios confirmados en WOLFGAMES")}`;}
function motoSessionCalendarUrl(race,session){const compact=date=>date.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z/,"Z"),start=new Date(session.start),end=new Date(start.getTime()+session.duration*60000);return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${session.name} · ${race.name}`)}&dates=${compact(start)}/${compact(end)}&location=${encodeURIComponent(race.circuit)}&details=${encodeURIComponent("Sesión de MotoGP · Horario peninsular en WOLFGAMES")}`;}
function startMotoCountdown(time,id){const el=document.getElementById(id);if(!el)return;const update=()=>{const ms=time-Date.now();if(ms<=0){el.textContent="🏁 En marcha";return;}const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000);el.textContent=`${d} d · ${h} h · ${m} min`;};update();setInterval(update,60000);}
function renderMotoCalendar(id="motogp-calendar"){
  const box=document.getElementById(id);if(!box)return;const next=getNextMotoGP();
  box.innerHTML=motogpCalendar.map(r=>{const past=motoWeekendEnd(r)<Date.now(),isNext=next===r;return `<article class="race-card${past?" is-past":""}${isNext?" is-next":""}"><span class="race-round">ROUND ${r.round}</span>${isNext?'<span class="race-status">SIGUIENTE</span>':""}<h3>${r.name}</h3><p>${r.circuit}</p><p class="race-date">${r.label}</p><a class="mini-action calendar-card-link" href="${motoCalendarUrl(r)}" target="_blank">＋ Añadir fin de semana a Google Calendar</a></article>`;}).join("");
}
function renderMotoSessionList(race,id="motogp-sessions"){
  const box=document.getElementById(id);if(!box)return;
  if(!race?.sessions?.length){box.innerHTML='<li class="session-row"><span><strong>Horarios detallados pendientes</strong><small>Se mostrarán cuando MotoGP publique el programa oficial.</small></span></li>';return;}
  box.innerHTML=race.sessions.map(session=>{const state=motoSessionState(session),label=state==="live"?"En directo":state==="finished"?"Finalizada":"Próxima";return `<li class="session-row ${state}"><span><strong>${session.name}</strong><small>${formatMotoSpainTime(session.start)}</small></span><span><em>${label}</em><a href="${motoSessionCalendarUrl(race,session)}" target="_blank" rel="noopener noreferrer">＋ Calendario</a></span></li>`;}).join("");
}
