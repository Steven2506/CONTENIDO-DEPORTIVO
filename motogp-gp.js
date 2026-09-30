(() => {
  const race=motogpCalendar.find(item=>item.id===new URLSearchParams(location.search).get("id"));
  const $=id=>document.getElementById(id),esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const pending=(title,detail="Esperando publicación o integración de datos oficiales.")=>`<div class="gp-pending-panel"><strong>${esc(title)}</strong><span>${esc(detail)}</span></div>`;
  const officialResults=window.MOTOGP_OFFICIAL_RESULTS?.byRound||{};

  if(!race){
    document.title="Gran Premio no encontrado · WOLFGAMES";$('gp-title').textContent="Gran Premio no encontrado";$('gp-country').textContent="No se encontró esa ficha";$('gp-status').textContent="ID no válido";
    $('gp-sessions').innerHTML=`<li class="gp-pending-session">${pending("Comprueba el calendario de MotoGP.")}</li>`;return;
  }

  const resultRecord=officialResults[race.round]||null;
  document.title=`${race.name} · MotoGP · WOLFGAMES`;document.body.style.setProperty("--gp-accent",race.accent);
  $("gp-country").textContent=`${race.flag} ${race.country}`;$("gp-title").textContent=race.name;$("gp-circuit-name").textContent=race.circuit;$("gp-round").textContent=`${race.round} / ${motogpCalendar.length}`;$("gp-dates").textContent=race.label;$("gp-location").textContent=`${race.circuit} · ${race.country}`;

  const sessions=race.sessions||[],lastEnd=motorsportRaceEnd("motogp",race),now=Date.now();
  $("gp-status").textContent=now>lastEnd?"FIN DE SEMANA FINALIZADO":sessions.some(session=>motoSessionState(session,now)==="live")?"EN CURSO":now>new Date(race.date).getTime()?"PROGRAMA PENDIENTE":"PRÓXIMAMENTE";

  if(sessions.length){
    $("gp-sessions").innerHTML=sessions.map((session,index)=>{
      const view=motorsportSessionView("motogp",session),label={live:"EN DIRECTO",finished:"FINALIZADA",upcoming:"PRÓXIMA",pending:"PENDIENTE",postponed:"APLAZADA",cancelled:"CANCELADA"}[view.status]||"PENDIENTE",stamp=new Intl.DateTimeFormat("es-ES",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:window.WolfTimezone?.get()||"Europe/Madrid"}).format(new Date(view.start));
      return `<li class="gp-session ${view.status==="live"?"is-live":""}"><span class="gp-session-number">${String(index+1).padStart(2,"0")}</span><span class="gp-session-info"><strong>${esc(view.name)}</strong><small>${esc(stamp)}</small></span><span class="status">${label}</span><a class="gp-result-link" href="#moto-result-${index}">Datos de sesión ↘</a></li>`;
    }).join("");
    $("gp-results").innerHTML=sessions.map((session,index)=>{
      const info=resultRecord?.sessions?.[session.name];
      return `<article class="gp-result-panel" id="moto-result-${index}"><div><p class="eyebrow">${esc(session.name)}</p><h3>${info?.classificationType==="podium"?"Podio oficial":info?"Primeros puestos oficiales":"Resultado de sesión"}</h3></div>${info?motoResultTable(info):pending("Datos de esta sesión pendientes","Se incorporarán cuando tengamos una clasificación oficial disponible para esta sesión.")}</article>`;
    }).join("");
  }else{
    $("gp-sessions").innerHTML=`<li class="gp-pending-session">${pending("Programa oficial pendiente","El calendario confirma el fin de semana; los horarios de sesiones aún no están disponibles.")}</li>`;
    $("gp-results").innerHTML=pending("Resultados pendientes","El programa detallado de este Gran Premio aún no está disponible.");
  }

  const raceFacts=resultRecord?.race;
  const facts=[["01","Ganador",raceFacts?.winner||"Pendiente de publicación"],["02","Podio",raceFacts?.podium?.join(" · ")||"Pendiente de publicación"],["03","Pole","Pendiente de integración oficial"],["04","Vuelta rápida",raceFacts?.fastestLap||"Pendiente de integración oficial"],["05","Abandonos",raceFacts?.retirements??"Pendiente de integración oficial"],["06","Safety car / bandera roja",raceFacts?.safetyCar??"Pendiente de integración oficial"]];
  $("gp-race-data").innerHTML=facts.map(([n,label,value])=>`<div class="gp-fact"><span class="gp-fact-index">${n}</span><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`).join("");

  const conditions=resultRecord?.conditions;
  $("gp-conditions").innerHTML=conditions?`<div class="gp-condition-grid"><div><small>CIELO</small><strong>${esc(conditions.sky||"Pendiente")}</strong></div><div><small>PISTA</small><strong>${esc(conditions.track||"Pendiente")}</strong></div><div><small>TEMPERATURA AMBIENTE</small><strong>${conditions.airTemperatureC==null?"Pendiente":`${esc(conditions.airTemperatureC)} °C`}</strong></div><div><small>TEMPERATURA DE PISTA</small><strong>${conditions.groundTemperatureC==null?"Pendiente":`${esc(conditions.groundTemperatureC)} °C`}</strong></div><div><small>HUMEDAD</small><strong>${conditions.humidityPercent==null?"Pendiente":`${esc(conditions.humidityPercent)}%`}</strong></div></div>`:pending("Condiciones pendientes","Sin observaciones meteorológicas verificadas para este Gran Premio.");

  const championship=resultRecord?.championship;
  $("gp-championship").innerHTML=championship?`<div class="gp-championship-grid"><section class="gp-championship-block"><h3>Clasificación de pilotos</h3><ol><li><b>1</b><span>Líder tras el GP</span><strong>${esc(championship.ridersLeader||"Pendiente")}</strong></li><li><b>+</b><span>Ventaja</span><strong>${championship.leadOverSecondPoints==null?"Pendiente":`${esc(championship.leadOverSecondPoints)} pts`}</strong></li></ol></section><section class="gp-championship-block"><h3>Constructores</h3>${pending("Clasificación pendiente","La tabla oficial de equipos aún no está integrada.")}</section></div>`:pending("Impacto en campeonato pendiente","Se completará cuando se integre la clasificación oficial posterior al Gran Premio.");

  const sourceNote=document.querySelector(".gp-source-note");
  if(sourceNote&&resultRecord?.sourceUrls?.length){
    sourceNote.innerHTML=`Datos disponibles actualizados el ${esc(window.MOTOGP_OFFICIAL_RESULTS.updatedAt)} · ${esc(resultRecord.source)}: ${resultRecord.sourceUrls.map((url,index)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Fuente ${index+1} ↗</a>`).join(" · ")}. El resto de campos permanece pendiente hasta su integración oficial.`;
  }

  function motoResultTable(info){
    const rows=(info.rows||[]).map(row=>`<tr><td>${esc(row.position)}</td><td><strong>${esc(row.rider)}</strong></td><td>${esc(row.team)}</td><td>${esc(row.result||"—")}</td>${info.classificationType==="top-results"?`<td>${esc(row.points??"—")}</td>`:""}</tr>`).join("");
    const points=info.classificationType==="top-results"?"<th>PTS</th>":"";
    const label=info.classificationType==="top-results"?"Top 3 de la clasificación publicada":"Podio publicado por MotoGP";
    return `<div><p class="gp-result-source-label">${label}</p><div class="gp-table-wrap"><table class="gp-classification"><thead><tr><th>POS</th><th>PILOTO</th><th>EQUIPO</th><th>TIEMPO / GAP</th>${points}</tr></thead><tbody>${rows}</tbody></table></div></div>`;
  }

  function updateCountdown(){
    const session=motorsportNextSession("motogp",race,Date.now()),view=session?motorsportSessionView("motogp",session):null;
    $("gp-countdown-session").textContent=view?.name||(sessions.length?"Fin de semana finalizado":"Horarios detallados pendientes");
    $("gp-countdown-time").textContent=view?new Intl.DateTimeFormat("es-ES",{weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit",timeZone:window.WolfTimezone?.get()||"Europe/Madrid"}).format(new Date(view.start)):sessions.length?"No quedan sesiones programadas":"Fechas del GP: "+race.label+" · hora de sesiones pendiente";
    $("gp-countdown-state").textContent=view?.status==="live"?"EN DIRECTO":view?.status==="upcoming"?"PRÓXIMA":sessions.length?"FINALIZADO":"PENDIENTE";
    const kicker=document.querySelector(".gp-countdown-kicker");if(kicker)kicker.textContent=view?"PRÓXIMA SESIÓN":sessions.length?"DATOS DE CARRERA":"FIN DE SEMANA";
    const target=view?new Date(view.start).getTime():NaN,diff=target-Date.now(),values=Number.isFinite(diff)&&diff>0?[Math.floor(diff/86400000),Math.floor(diff%86400000/3600000),Math.floor(diff%3600000/60000),Math.floor(diff%60000/1000)]:["—","—","—","—"];
    ["gp-count-days","gp-count-hours","gp-count-minutes","gp-count-seconds"].forEach((id,index)=>$(id).textContent=values[index]==="—"?values[index]:String(values[index]).padStart(index?2:1,"0"));
  }
  updateCountdown();setInterval(()=>{if(!document.hidden)updateCountdown();},1000);
})();
