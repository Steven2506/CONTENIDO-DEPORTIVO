const championsState={round:1};

document.addEventListener("DOMContentLoaded",()=>{
  championsState.round=findChampionsRound();
  renderChampions();
  document.getElementById("champions-round-select")?.addEventListener("change",event=>{championsState.round=Number(event.currentTarget.value);renderChampionsViews();});
  document.querySelectorAll("[data-champions-view]").forEach(button=>button.addEventListener("click",()=>switchChampionsView(button)));
  bindChampionsDetails();
  setInterval(()=>{if(!document.hidden)renderChampionsViews();},60000);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)renderChampionsViews();});
});

function championsEscape(value=""){return String(value).replace(/[&<>"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[char]);}
function allChampionsMatches(){return championsData.rounds.flatMap(round=>round.matches||[]);}
function championsMatchState(match){
  const hasScore=Number.isInteger(match.homeScore)&&Number.isInteger(match.awayScore);
  const explicitStatus=String(match.status||"").trim().toLowerCase();
  if(match.state==="finished"||["final","finalizado","ft","fulltime","completed"].includes(explicitStatus))return hasScore?"finished":"pending";
  if(match.state==="live"){
    const kickoff=match.iso?new Date(match.iso).getTime():NaN;
    const elapsed=Number.isFinite(kickoff)?Date.now()-kickoff:0;
    if(elapsed>180*60000)return hasScore?"finished":"pending";
    return "live";
  }
  return match.state||"scheduled";
}
function findChampionsRound(){
  const now=Date.now(),live=championsData.rounds.find(round=>(round.matches||[]).some(match=>championsMatchState(match)==="live"));if(live)return live.round;
  const future=championsData.rounds.map(round=>({round:round.round,time:Math.min(...(round.matches||[]).map(match=>new Date(match.iso).getTime()).filter(time=>Number.isFinite(time)&&time>=now-3*3600000))})).filter(item=>Number.isFinite(item.time)).sort((a,b)=>a.time-b.time)[0];
  return future?.round||1;
}
function switchChampionsView(button){
  const target=button.dataset.championsView;
  document.querySelectorAll("[data-champions-view]").forEach(item=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-selected",String(active));});
  document.querySelectorAll("[data-champions-panel]").forEach(panel=>panel.hidden=panel.dataset.championsPanel!==target);
}
function renderChampions(){
  document.getElementById("champions-updated").textContent=`Actualizado: ${championsData.updated}`;
  const selector=document.getElementById("champions-round-select");
  selector.innerHTML=championsData.rounds.map(item=>`<option value="${item.round}"${item.round===championsState.round?" selected":""}>Jornada ${item.round} · ${item.label}</option>`).join("");
  document.getElementById("champions-standing").innerHTML=`<table class="standing-table champions-standing-table"><thead><tr><th>Pos.</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>DG</th><th>PTS</th></tr></thead><tbody>${championsData.standings.map(row=>`<tr class="champions-zone-${row.pos<=8?"direct":row.pos<=24?"playoff":"out"}" data-team="${championsEscape(row.team)}"><td><b>${row.pos}</b></td><th scope="row">${championsEscape(row.team)}</th><td>${row.played}</td><td>${row.won}</td><td>${row.drawn}</td><td>${row.lost}</td><td>${row.gf}</td><td>${row.ga}</td><td>${row.gd>0?`+${row.gd}`:row.gd}</td><td><strong>${row.points}</strong></td></tr>`).join("")}</tbody></table>`;
  document.getElementById("champions-draw-overview").innerHTML=championsDrawOverview();
  renderChampionsViews();renderChampionsBracket();
  const knockoutActive=championsData.knockout?.active===true||championsData.phase==="knockout";
  const knockoutTab=document.getElementById("champions-knockout-tab");
  if(knockoutTab)knockoutTab.hidden=!knockoutActive;
  if(knockoutActive&&championsData.phase==="knockout")switchChampionsView(knockoutTab);
  requestAnimationFrame(()=>window.applyTeamPreference?.());
}
function renderChampionsViews(){
  const round=championsData.rounds.find(item=>item.round===championsState.round)||championsData.rounds[0],matches=round.matches||[],all=allChampionsMatches();
  document.getElementById("champions-round-title").textContent=`Jornada ${round.round} · ${round.label}`;
  document.getElementById("champions-score-strip").innerHTML=matches.length?matches.map(championsCompactScore).join(""):championsEmpty("Partidos pendientes","UEFA todavía no ha publicado las tarjetas completas de esta jornada.");
  document.getElementById("champions-matches").innerHTML=matches.length?matches.map(championsMatchCard).join(""):championsEmpty("Calendario pendiente","Los partidos aparecerán al confirmarse oficialmente.");
  const live=all.filter(match=>championsMatchState(match)==="live").sort((a,b)=>new Date(a.iso)-new Date(b.iso));
  const results=matches.filter(match=>championsMatchState(match)==="finished");
  document.getElementById("champions-live-count").textContent=live.length;
  document.getElementById("champions-live-matches").innerHTML=live.length?live.map(championsMatchCard).join(""):championsEmpty("No hay partidos en directo","Los encuentros activos de cualquier jornada aparecerán aquí automáticamente.");
  document.getElementById("champions-results").innerHTML=results.length?results.map(championsMatchCard).join(""):championsEmpty("Todavía no hay resultados","Los marcadores definitivos se guardarán en su jornada.");
  requestAnimationFrame(()=>window.applyTeamPreference?.());
}
function championsLocal(match){const zone=window.WolfTimezone?.get()||"Europe/Madrid",date=new Date(match.iso);return{date:new Intl.DateTimeFormat("es-ES",{weekday:"long",day:"numeric",month:"long",timeZone:zone}).format(date),short:new Intl.DateTimeFormat("es-ES",{weekday:"short",day:"numeric",timeZone:zone}).format(date).replace(".",""),time:new Intl.DateTimeFormat("es-ES",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:zone}).format(date)};}
function championsStatus(match){const state=championsMatchState(match);if(state==="live")return "EN JUEGO";if(state==="finished")return "FINAL";if(state==="pending")return "POR CONFIRMAR";return championsLocal(match).time;}
function championsCompactScore(match){const state=championsMatchState(match),local=championsLocal(match),score=Number.isInteger(match.homeScore)&&Number.isInteger(match.awayScore);return `<article class="score-chip ${state}" data-teams="${championsEscape(match.home)}|${championsEscape(match.away)}"><div class="score-chip-top"><span>${local.short}</span><strong>${championsStatus(match)}</strong></div><div><span>${championsEscape(match.home)}</span><b>${score?match.homeScore:"–"}</b></div><div><span>${championsEscape(match.away)}</span><b>${score?match.awayScore:"–"}</b></div></article>`;}
function championsMatchCard(match){const state=championsMatchState(match),local=championsLocal(match),score=Number.isInteger(match.homeScore)&&Number.isInteger(match.awayScore);return `<article class="match-card scoreboard-card ${state} champions-detail-trigger" tabindex="0" role="button" data-champions-key="${championsEscape(match.home)}|${championsEscape(match.away)}" data-teams="${championsEscape(match.home)}|${championsEscape(match.away)}" aria-label="Ver ficha de ${championsEscape(match.home)} contra ${championsEscape(match.away)}"><div class="match-meta"><span>${championsEscape(local.date)} · ${local.time}</span><span class="status ${state}">${championsStatus(match)}</span></div><div class="score-teams"><strong>${championsEscape(match.home)}</strong><span class="big-score">${score?`${match.homeScore}<i>–</i>${match.awayScore}`:"VS"}</span><strong>${championsEscape(match.away)}</strong></div>${state==="live"?'<p class="live-message"><span class="live-dot"></span> En directo</p>':""}<p class="detail-hint">Toca la ficha para ver los detalles →</p><div class="card-actions"><button class="btn-link share-event" data-share="${championsEscape(match.home)} vs ${championsEscape(match.away)} · ${local.date}, ${local.time}">Compartir</button><a class="btn-link" href="${championsCalendarUrl(match)}" target="_blank" rel="noopener noreferrer">Añadir al calendario</a></div></article>`;}
function bindChampionsDetails(){
  const dialog=document.getElementById("match-detail-dialog");
  document.addEventListener("click",event=>{const trigger=event.target.closest(".champions-detail-trigger");if(!trigger||event.target.closest("a,button"))return;openChampionsDetails(trigger.dataset.championsKey);});
  document.addEventListener("keydown",event=>{if((event.key==="Enter"||event.key===" ")&&event.target.matches(".champions-detail-trigger")){event.preventDefault();openChampionsDetails(event.target.dataset.championsKey);}});
  dialog?.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
}
function championsIncidentList(details){const incidents=Array.isArray(details?.events)?details.events:[];if(!incidents.length)return '<p class="detail-pending">UEFA todavía no ha publicado las incidencias del encuentro.</p>';const labels={goal:"⚽ Gol",red:"🟥 Expulsión",yellow:"🟨 Tarjeta amarilla",substitution:"🔄 Sustitución"};return '<ul class="incident-list">' + incidents.map(event=>'<li class="' + championsEscape(event.type||"") + '"><strong>' + championsEscape(event.minute||"–") + '’</strong><span>' + (labels[event.type]||"• Incidencia") + ' · ' + championsEscape(event.player||"Jugador") + ' <small>' + championsEscape(event.team||"") + '</small></span></li>').join("") + '</ul>';}
