function motoCountdownLabel(ms){
  if(ms<=0)return "🔴 En curso";
  const days=Math.floor(ms/86400000),hours=Math.floor(ms%86400000/3600000),minutes=Math.floor(ms%3600000/60000),seconds=Math.floor(ms%60000/1000);
  return days?`${days} d · ${hours} h · ${minutes} min`:`${hours} h · ${minutes} min · ${seconds} s`;
}

function renderNextMoto(updateSessions=true){
  const race=getNextMotoGP(),title=document.getElementById("next-moto-title"),place=document.getElementById("next-moto-place"),sessionLabel=document.getElementById("next-moto-session"),countdown=document.getElementById("next-moto-countdown"),list=document.getElementById("next-moto-sessions");
  if(!title)return;
  const link=document.getElementById("next-moto-link"),round=document.getElementById("motogp-next-round"),country=document.getElementById("motogp-next-country"),scheduleState=document.getElementById("motogp-schedule-state");
  if(!race){title.textContent="Temporada finalizada";place.textContent="No quedan Grandes Premios programados.";sessionLabel.textContent="";countdown.textContent="🏁";list.innerHTML="";if(link)link.href="MotoGP.html#motogp-calendar";if(round)round.textContent="—";if(country)country.textContent="—";if(scheduleState)scheduleState.textContent="FINALIZADA";return;}
  const nextSession=getNextMotoSession(race),localDate=(value,options={})=>new Intl.DateTimeFormat("es-ES",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:window.WolfTimezone?.get()||"Europe/Madrid",...options}).format(new Date(value));
  title.textContent=race.name;place.textContent=`📍 ${race.circuit} · ${race.country}`;
  sessionLabel.textContent=nextSession?`${motoSessionState(nextSession)==="live"?"🔴 EN DIRECTO":"⏱️ PRÓXIMA SESIÓN"} · ${nextSession.name} · ${localDate(nextSession.start)}`:"Los horarios detallados de este GP aún no están publicados.";
  countdown.textContent=nextSession?motoCountdownLabel(new Date(nextSession.start).getTime()-Date.now()):"HORARIOS PENDIENTES";
  if(link)link.href=`motogp-gp.html?id=${encodeURIComponent(race.id)}`;
  if(round)round.textContent=`${race.round} / ${motogpCalendar.length}`;
  if(country)country.textContent=race.country;
  if(scheduleState)scheduleState.textContent=nextSession?"PUBLICADOS":"PENDIENTES";
  if(updateSessions)renderMotoSessionList(race,"next-moto-sessions");
}

function renderLastMoto(){
  const race=getLastMotoGP(),target=document.getElementById("last-moto-result");
  if(!target)return;
  const link=document.getElementById("last-moto-link");
  if(!race){target.innerHTML="<strong>Aún no hay un Gran Premio completado</strong><span>Los resultados aparecerán cuando se publique la primera clasificación oficial.</span>";if(link)link.hidden=true;return;}
  const raceEnd=motorsportRaceEnd("motogp",race),date=Number.isFinite(raceEnd)?new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"long",year:"numeric",timeZone:"Europe/Madrid"}).format(new Date(raceEnd)):race.label;
  const official=window.MOTOGP_OFFICIAL_RESULTS?.byRound?.[race.round],podium=official?.race?.podium;
  target.innerHTML=podium?.length?`<strong>${podium[0]} · ganador</strong><span>Podio: ${podium.join(" · ")}</span><span>${race.name} · ${race.circuit} · ${date}</span>`:`<strong>${race.name}</strong><span>${race.circuit} · ${date}</span><span>Clasificación oficial pendiente de integrar en WOLFGAMES.</span>`;
  if(link){link.href=`motogp-gp.html?id=${encodeURIComponent(race.id)}`;link.hidden=false;}
}

document.addEventListener("DOMContentLoaded",()=>{
  renderMotoCalendar();
  const count=document.getElementById("motogp-calendar-count"),heroCount=document.getElementById("motogp-round-count");
  if(count)count.textContent=`${motogpCalendar.length} GRANDES PREMIOS`;
  if(heroCount)heroCount.textContent=String(motogpCalendar.length);
  renderNextMoto();renderLastMoto();
  setInterval(()=>{if(!document.hidden)renderNextMoto(false);},1000);
  setInterval(()=>{if(!document.hidden)renderMotoSessionList(getNextMotoGP(),"next-moto-sessions");},60000);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden){renderNextMoto();renderLastMoto();}});
});
