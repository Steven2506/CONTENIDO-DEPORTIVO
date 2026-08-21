const scoreState={round:footballData.currentRound};

document.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("football-updated").textContent=`Actualizado: ${footballData.updated}`;
  const selector=document.getElementById("round-select");
  const rounds=Object.keys(footballData.laligaRounds).map(Number).sort((a,b)=>a-b);
  selector.innerHTML=rounds.map(round=>`<option value="${round}"${round===scoreState.round?" selected":""}>Jornada ${round}</option>`).join("");
  selector.addEventListener("change",()=>{scoreState.round=Number(selector.value);renderFootball();});
  document.getElementById("refresh-scores").addEventListener("click",event=>{renderFootball();event.currentTarget.textContent="✓ Actualizado";setTimeout(()=>event.currentTarget.textContent="↻ Actualizar",1400);});
  document.getElementById("champions-draw").textContent=`Sorteo: ${footballData.champions.draw}`;
  document.getElementById("champions-dates").innerHTML=footballData.champions.rounds.map(round=>`<li>${round}</li>`).join("");
  document.getElementById("laliga-standing-note").textContent=footballData.standingsNote;
  document.getElementById("laliga-standing").innerHTML=footballData.laligaStandings.map(row=>`<div class="standing-row" data-team="${row.team}"><b>${row.pos}</b><span><strong>${row.team}</strong></span><strong>${row.points} pts</strong></div>`).join("");
  bindTabs("[data-tab]","[data-panel]","tab","panel");
  bindTabs("[data-football-view]","[data-football-panel]","footballView","footballPanel");
  renderFootball();
});

function bindTabs(buttonSelector,panelSelector,buttonKey,panelKey){document.querySelectorAll(buttonSelector).forEach(button=>button.addEventListener("click",()=>{const target=button.dataset[buttonKey];document.querySelectorAll(buttonSelector).forEach(item=>{item.classList.toggle("active",item===button);item.setAttribute("aria-selected",String(item===button));});document.querySelectorAll(panelSelector).forEach(panel=>panel.hidden=panel.dataset[panelKey]!==target);}));}

function renderFootball(){
  const matches=footballData.laligaRounds[scoreState.round]||[];
  document.getElementById("round-title").textContent=`Jornada ${scoreState.round} · ${matches.length} partidos`;
  document.getElementById("score-strip").innerHTML=matches.map(compactScore).join("");
  document.getElementById("laliga-matches").innerHTML=matches.map(fullMatch).join("");
  const live=matches.filter(match=>match.state==="live");
  const finished=matches.filter(match=>match.state==="finished"||match.status==="Finalizado");
  document.getElementById("live-count").textContent=live.length;
  document.getElementById("live-matches").innerHTML=live.length?live.map(fullMatch).join(""):emptyState("No hay partidos en directo","Cuando comience un encuentro, el marcador y el minuto aparecerán aquí automáticamente.");
  document.getElementById("finished-matches").innerHTML=finished.length?finished.map(fullMatch).join(""):emptyState("Todavía no hay resultados","Los partidos finalizados se guardarán aquí con su marcador definitivo.");
  requestAnimationFrame(()=>window.applyTeamPreference?.());
}

function matchState(match){if(match.state)return match.state;if(match.status==="Finalizado")return "finished";return "scheduled";}
function scoreValue(value){return Number.isInteger(value)?value:"–";}
function statusLabel(match){const state=matchState(match);if(state==="live")return `${match.minute||"EN JUEGO"}${match.minute?"’":""}`;if(state==="finished")return "FINAL";return match.time;}
function compactScore(match){const state=matchState(match);return `<article class="score-chip ${state}" data-teams="${match.home}|${match.away}"><div class="score-chip-top"><span>${shortDate(match.date)}</span><strong>${statusLabel(match)}</strong></div><div><span>${match.home}</span><b>${scoreValue(match.homeScore)}</b></div><div><span>${match.away}</span><b>${scoreValue(match.awayScore)}</b></div></article>`;}
function fullMatch(match){const state=matchState(match),hasScore=Number.isInteger(match.homeScore)&&Number.isInteger(match.awayScore),calendarAction=match.iso?`<a class="btn-link" href="${calendarUrl(match)}" target="_blank" rel="noopener noreferrer">Añadir al calendario</a>`:'<span class="calendar-pending">Calendario disponible cuando se confirme el horario</span>';return `<article class="match-card scoreboard-card ${state}" data-teams="${match.home}|${match.away}"><div class="match-meta"><span>${match.date} · ${match.time}</span><span class="status ${state}">${statusLabel(match)}</span></div><div class="score-teams"><strong>${match.home}</strong><span class="big-score">${hasScore?`${match.homeScore}<i>–</i>${match.awayScore}`:"VS"}</span><strong>${match.away}</strong></div>${state==="live"?`<p class="live-message"><span class="live-dot"></span> Actualización del marcador en curso</p>`:""}${state==="finished"&&!hasScore?'<p class="sync-note">Resultado pendiente de sincronización con la fuente oficial.</p>':""}<p>📍 ${match.venue}</p><div class="referee-box"><strong>Designación arbitral</strong><span>Árbitro: ${match.referee||"Pendiente de publicación oficial"}</span><span>VAR: ${match.var||"Pendiente de publicación oficial"}</span></div><div class="card-actions"><button class="btn-link share-event" data-share="${match.home} vs ${match.away} · ${match.date}, ${match.time}">Compartir</button>${calendarAction}</div></article>`;}
function emptyState(title,text){return `<div class="score-empty"><span aria-hidden="true">⚽</span><h4>${title}</h4><p>${text}</p></div>`;}
function shortDate(date){return date.replace(/ de agosto/i,"").replace("Jueves","Jue").replace("Viernes","Vie").replace("Sábado","Sáb").replace("Domingo","Dom").replace("Lunes","Lun");}
function calendarStamp(date){return date.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z/,"Z");}
function calendarUrl(match){const start=new Date(match.iso),end=new Date(start.getTime()+2*3600000);return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${match.home} vs ${match.away}`)}&dates=${calendarStamp(start)}/${calendarStamp(end)}&location=${encodeURIComponent(match.venue)}`;}

window.WolfGamesScores={
  updateMatch(round,home,patch){const match=footballData.laligaRounds[round]?.find(item=>item.home===home);if(!match)return false;Object.assign(match,patch);if(round===scoreState.round)renderFootball();return true;},
  refresh:renderFootball
};
