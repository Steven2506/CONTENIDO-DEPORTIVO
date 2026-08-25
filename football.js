const scoreState={round:footballData.currentRound};

document.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("football-updated").textContent=`Actualizado: ${footballData.updated}`;
  const selector=document.getElementById("round-select");
  const rounds=Object.keys(footballData.laligaRounds).map(Number).sort((a,b)=>a-b);
  selector.innerHTML=rounds.map(round=>`<option value="${round}"${round===scoreState.round?" selected":""}>Jornada ${round}</option>`).join("");
  selector.addEventListener("change",()=>{scoreState.round=Number(selector.value);renderFootball();});
  document.getElementById("refresh-scores").addEventListener("click",async event=>{event.currentTarget.textContent="Comprobando…";const changed=await checkForDataUpdate();if(!changed){renderFootball();event.currentTarget.textContent="✓ Actualizado";setTimeout(()=>event.currentTarget.textContent="↻ Actualizar",1400);}});
  document.getElementById("laliga-standing-note").textContent=footballData.standingsNote;
  document.getElementById("laliga-standing").innerHTML=`<table class="standing-table"><thead><tr><th scope="col">Pos.</th><th scope="col">Equipo</th><th scope="col" title="Partidos jugados">PJ</th><th scope="col" title="Victorias">PG</th><th scope="col" title="Empates">PE</th><th scope="col" title="Derrotas">PP</th><th scope="col" title="Goles a favor">GF</th><th scope="col" title="Goles en contra">GC</th><th scope="col" title="Diferencia de goles">DG</th><th scope="col">PTS</th></tr></thead><tbody>${footballData.laligaStandings.map(row=>`<tr data-team="${escapeHtml(row.team)}"><td><b>${row.pos}</b></td><th scope="row">${escapeHtml(row.team)}</th><td>${row.played}</td><td>${row.won}</td><td>${row.drawn}</td><td>${row.lost}</td><td>${row.gf}</td><td>${row.ga}</td><td>${row.gd>0?`+${row.gd}`:row.gd}</td><td><strong>${row.points}</strong></td></tr>`).join("")}</tbody></table>`;
  bindTabs("[data-tab]","[data-panel]","tab","panel");
  bindTabs("[data-football-view]","[data-football-panel]","footballView","footballPanel");
  renderFootball();
  bindMatchDetails();
  setInterval(()=>{renderFootball();checkForDataUpdate();},60000);
});

async function checkForDataUpdate(){try{const response=await fetch(`sports-data.js?poll=${Date.now()}`,{cache:"no-store"});if(!response.ok)return false;const source=await response.text(),revision=source.match(/updated:"([^"]+)"/)?.[1];if(revision&&revision!==footballData.updated){location.reload();return true;}}catch(error){console.info("Sincronización temporalmente no disponible.");}return false;}

function bindTabs(buttonSelector,panelSelector,buttonKey,panelKey){document.querySelectorAll(buttonSelector).forEach(button=>button.addEventListener("click",()=>{const target=button.dataset[buttonKey];document.querySelectorAll(buttonSelector).forEach(item=>{item.classList.toggle("active",item===button);item.setAttribute("aria-selected",String(item===button));});document.querySelectorAll(panelSelector).forEach(panel=>panel.hidden=panel.dataset[panelKey]!==target);}));}

function renderFootball(){
  const matches=footballData.laligaRounds[scoreState.round]||[];
  document.getElementById("round-title").textContent=`Jornada ${scoreState.round} · ${matches.length} partidos`;
  document.getElementById("score-strip").innerHTML=matches.map(compactScore).join("");
  document.getElementById("laliga-matches").innerHTML=matches.map(fullMatch).join("");
  const live=matches.filter(match=>matchState(match)==="live");
  const finished=matches.filter(match=>matchState(match)==="finished");
  document.getElementById("live-count").textContent=live.length;
  document.getElementById("live-matches").innerHTML=live.length?live.map(fullMatch).join(""):emptyState("No hay partidos en directo","Cuando comience un encuentro, el marcador y el minuto aparecerán aquí automáticamente.");
  document.getElementById("finished-matches").innerHTML=finished.length?finished.map(fullMatch).join(""):emptyState("Todavía no hay resultados","Los partidos finalizados se guardarán aquí con su marcador definitivo.");
  requestAnimationFrame(()=>window.applyTeamPreference?.());
}

function inferredKickoffState(match){if(!match.iso||match.state)return null;const elapsed=Date.now()-new Date(match.iso).getTime();return elapsed>=0&&elapsed<3*60*60*1000?"live":null;}
function matchState(match){if(match.state)return match.state;if(match.status==="Finalizado")return "finished";return inferredKickoffState(match)||"scheduled";}
function scoreValue(value){return Number.isInteger(value)?value:"–";}
function statusLabel(match){const state=matchState(match);if(state==="live"){if(match.state!=="live"){const elapsed=Math.max(0,Math.floor((Date.now()-new Date(match.iso).getTime())/60000));if(elapsed<50)return `${Math.min(45,elapsed+1)}’`;if(elapsed<65)return "DESCANSO";return `${Math.min(90,46+elapsed-65)}’`;}if(match.period==="HalfTime")return "DESCANSO";const elapsed=match.periodStart?Math.max(0,Math.floor((Date.now()-new Date(match.periodStart).getTime())/60000)):null;if(match.period==="FirstHalf"&&elapsed!==null&&elapsed>=55)return "DESCANSO";const minute=elapsed===null?match.minute:(match.periodBase||0)+elapsed+1;if(!minute)return "EN JUEGO";if(match.period==="FirstHalf"&&minute>45)return `45+${minute-45}’`;if(match.period==="SecondHalf"&&minute>90)return `90+${minute-90}’`;return `${minute}’`;}if(state==="finished")return "FINAL";if(state==="rescheduled")return "REPROGRAMADO";if(state==="postponed")return "APLAZADO";return match.time;}
function matchKey(match){return `${match.home}|||${match.away}`;}
function compactScore(match){const state=matchState(match);return `<article class="score-chip ${state} match-detail-trigger" tabindex="0" role="button" data-match-key="${escapeHtml(matchKey(match))}" data-teams="${match.home}|${match.away}" aria-label="Ver ficha de ${match.home} contra ${match.away}"><div class="score-chip-top"><span>${shortDate(match.date)}</span><strong>${statusLabel(match)}</strong></div><div><span>${match.home}</span><b>${scoreValue(match.homeScore)}</b></div><div><span>${match.away}</span><b>${scoreValue(match.awayScore)}</b></div></article>`;}
function fullMatch(match){const state=matchState(match),hasScore=Number.isInteger(match.homeScore)&&Number.isInteger(match.awayScore),calendarAction=match.iso?`<a class="btn-link" href="${calendarUrl(match)}" target="_blank" rel="noopener noreferrer">Añadir al calendario</a>`:'<span class="calendar-pending">Calendario disponible cuando se confirme el horario</span>',scheduleNotice=state==="rescheduled"?`<p class="rescheduled-note"><strong>↻ Partido reprogramado</strong><span>${match.scheduleNote||"Nueva fecha y hora confirmadas"}: ${match.date} a las ${match.time}.</span></p>`:"";return `<article class="match-card scoreboard-card ${state} match-detail-trigger" tabindex="0" role="button" data-match-key="${escapeHtml(matchKey(match))}" data-teams="${match.home}|${match.away}" aria-label="Ver ficha de ${match.home} contra ${match.away}"><div class="match-meta"><span>${match.date} · ${match.time}</span><span class="status ${state}">${statusLabel(match)}</span></div><div class="score-teams"><strong>${match.home}</strong><span class="big-score">${hasScore?`${match.homeScore}<i>–</i>${match.awayScore}`:"VS"}</span><strong>${match.away}</strong></div>${state==="live"?`<p class="live-message"><span class="live-dot"></span> En directo</p>`:""}${state==="finished"&&!hasScore?'<p class="sync-note">Resultado pendiente de sincronización con la fuente oficial.</p>':""}${scheduleNotice}<p>📍 ${match.venue}</p><div class="referee-box"><strong>Designación arbitral</strong><span>Árbitro: ${match.referee||"Pendiente de publicación oficial"}</span><span>VAR: ${match.var||"Pendiente de publicación oficial"}</span></div><p class="detail-hint">Toca la ficha para ver alineaciones y estadísticas →</p><div class="card-actions"><button class="btn-link share-event" data-share="${match.home} vs ${match.away} · ${match.date}, ${match.time}">Compartir</button>${calendarAction}</div></article>`;}
function emptyState(title,text){return `<div class="score-empty"><span aria-hidden="true">⚽</span><h4>${title}</h4><p>${text}</p></div>`;}
function shortDate(date){return date.replace(/ de agosto/i,"").replace("Jueves","Jue").replace("Viernes","Vie").replace("Sábado","Sáb").replace("Domingo","Dom").replace("Lunes","Lun");}
function calendarStamp(date){return date.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z/,"Z");}
function calendarUrl(match){const start=new Date(match.iso),end=new Date(start.getTime()+2*3600000);return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${match.home} vs ${match.away}`)}&dates=${calendarStamp(start)}/${calendarStamp(end)}&location=${encodeURIComponent(match.venue)}`;}

function bindMatchDetails(){
  const dialog=document.getElementById("match-detail-dialog");
  document.addEventListener("click",event=>{const trigger=event.target.closest(".match-detail-trigger");if(!trigger||event.target.closest("a,button"))return;openMatchDetails(trigger.dataset.matchKey);});
  document.addEventListener("keydown",event=>{if((event.key==="Enter"||event.key===" ")&&event.target.matches(".match-detail-trigger")){event.preventDefault();openMatchDetails(event.target.dataset.matchKey);}});
  document.getElementById("close-match-detail")?.addEventListener("click",()=>dialog.close());
  dialog?.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
}

function findMatch(key){for(const matches of Object.values(footballData.laligaRounds)){const match=matches.find(item=>matchKey(item)===key);if(match)return match;}return null;}
function escapeHtml(value=""){return String(value).replace(/[&<>"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[char]);}
function prediction(match){const table=footballData.laligaStandings||[],home=table.find(row=>row.team===match.home),away=table.find(row=>row.team===match.away),positionEdge=home&&away?Math.max(-12,Math.min(12,(away.pos-home.pos)*1.15)):0,homePct=Math.round(41+positionEdge),drawPct=29,awayPct=100-homePct-drawPct;return {home:homePct,draw:drawPct,away:awayPct};}
function probabilityBar(label,value,className){return `<div class="probability-item"><span>${escapeHtml(label)}</span><strong>${value}%</strong><i><b class="${className}" style="width:${value}%"></b></i></div>`;}
function statRow(label,home,away,suffix=""){const left=home??"–",right=away??"–",total=Number(home||0)+Number(away||0),leftWidth=total?Math.round(Number(home||0)*100/total):50;return `<div class="detail-stat"><div><strong>${left}${suffix}</strong><span>${escapeHtml(label)}</span><strong>${right}${suffix}</strong></div><i><b style="width:${leftWidth}%"></b></i></div>`;}
function lineupColumn(team,data){if(!data?.starters?.length)return `<section class="lineup-team"><h4>${escapeHtml(team)}</h4><p class="detail-pending">Alineación pendiente de confirmación oficial.</p></section>`;return `<section class="lineup-team"><h4>${escapeHtml(team)} <small>${escapeHtml(data.formation||"")}</small></h4>${data.manager?`<p class="manager">Entrenador: ${escapeHtml(data.manager)}</p>`:""}<ol>${data.starters.map(player=>`<li><b>${player.number||"–"}</b><span>${escapeHtml(player.name)}</span></li>`).join("")}</ol></section>`;}
function incidentList(details){const incidents=details?.events||[];if(!incidents.length)return '<p class="detail-pending">Los goles, tarjetas rojas y otros momentos decisivos aparecerán aquí durante el encuentro.</p>';return `<ul class="incident-list">${incidents.map(event=>`<li class="${event.type}"><strong>${event.minute}’</strong><span>${event.type==="goal"?"⚽ Gol":"🟥 Expulsión"} · ${escapeHtml(event.player)} <small>${escapeHtml(event.team||"")}</small></span></li>`).join("")}</ul>`;}
function openMatchDetails(key){
  const match=findMatch(key),dialog=document.getElementById("match-detail-dialog"),content=document.getElementById("match-detail-content");if(!match||!dialog||!content)return;
  const details=match.details||{},stats=details.stats||{},probability=prediction(match),hasScore=Number.isInteger(match.homeScore)&&Number.isInteger(match.awayScore);
  content.innerHTML=`<header class="detail-score"><p>${escapeHtml(match.date)} · ${escapeHtml(match.time)}</p><span class="status ${matchState(match)}">${statusLabel(match)}</span><div><strong>${escapeHtml(match.home)}</strong><b>${hasScore?`${match.homeScore} – ${match.awayScore}`:"VS"}</b><strong>${escapeHtml(match.away)}</strong></div><small>📍 ${escapeHtml(match.venue)}</small></header><section class="detail-section"><div class="detail-title"><h3>Probabilidad del partido</h3><span>Estimación WOLFGAMES</span></div><div class="probabilities">${probabilityBar(match.home,probability.home,"home")}${probabilityBar("Empate",probability.draw,"draw")}${probabilityBar(match.away,probability.away,"away")}</div><p class="method-note">Estimación orientativa basada en localía y posición liguera; no es una cuota de apuestas ni un dato oficial.</p></section><section class="detail-section"><div class="detail-title"><h3>Alineaciones</h3><span>${details.source||"Fuente oficial LALIGA"}</span></div><div class="lineups-grid">${lineupColumn(match.home,details.lineups?.home)}${lineupColumn(match.away,details.lineups?.away)}</div></section><section class="detail-section"><div class="detail-title"><h3>Estadísticas</h3><span>${details.updatedAt?`Actualizado ${escapeHtml(details.updatedAt)}`:"Disponibles al comenzar"}</span></div><div class="stats-list">${statRow("Posesión",stats.home?.possession,stats.away?.possession,"%")} ${statRow("Pases",stats.home?.passes,stats.away?.passes)} ${statRow("Tiros",stats.home?.shots,stats.away?.shots)} ${statRow("Tiros a puerta",stats.home?.shotsOnTarget,stats.away?.shotsOnTarget)} ${statRow("Tarjetas amarillas",stats.home?.yellowCards,stats.away?.yellowCards)} ${statRow("Tarjetas rojas",stats.home?.redCards,stats.away?.redCards)}</div></section><section class="detail-section"><div class="detail-title"><h3>Goles y expulsiones</h3><span>En directo</span></div>${incidentList(details)}</section>`;
  dialog.showModal();
}

window.WolfGamesScores={
  updateMatch(round,home,patch){const match=footballData.laligaRounds[round]?.find(item=>item.home===home);if(!match)return false;Object.assign(match,patch);if(round===scoreState.round)renderFootball();return true;},
  refresh:renderFootball
};
