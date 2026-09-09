const championsState={round:1};

document.addEventListener("DOMContentLoaded",()=>{
  championsState.round=findChampionsRound();
  renderChampions();
  document.getElementById("champions-round-select")?.addEventListener("change",event=>{championsState.round=Number(event.currentTarget.value);renderChampionsViews();});
  document.querySelectorAll("[data-champions-view]").forEach(button=>button.addEventListener("click",()=>switchChampionsView(button)));
  setInterval(renderChampionsViews,60000);
});

function championsEscape(value=""){return String(value).replace(/[&<>"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[char]);}
function allChampionsMatches(){return championsData.rounds.flatMap(round=>round.matches||[]);}
function championsMatchState(match){
  if(match.state==="finished")return "finished";
  const kickoff=match.iso?new Date(match.iso).getTime():NaN,elapsed=Date.now()-kickoff;
  if(match.state==="live")return elapsed>150*60000?"pending":"live";
  if(Number.isFinite(kickoff)&&elapsed>=0&&elapsed<150*60000)return "live";
  if(Number.isFinite(kickoff)&&elapsed>=150*60000)return "pending";
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
  renderChampionsViews();renderChampionsBracket();requestAnimationFrame(()=>window.applyTeamPreference?.());
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
function championsMatchCard(match){const state=championsMatchState(match),local=championsLocal(match),score=Number.isInteger(match.homeScore)&&Number.isInteger(match.awayScore);return `<article class="match-card scoreboard-card ${state}" data-teams="${championsEscape(match.home)}|${championsEscape(match.away)}"><div class="match-meta"><span>${championsEscape(local.date)} · ${local.time}</span><span class="status ${state}">${championsStatus(match)}</span></div><div class="score-teams"><strong>${championsEscape(match.home)}</strong><span class="big-score">${score?`${match.homeScore}<i>–</i>${match.awayScore}`:"VS"}</span><strong>${championsEscape(match.away)}</strong></div>${state==="live"?'<p class="live-message"><span class="live-dot"></span> En directo</p>':""}<div class="card-actions"><button class="btn-link share-event" data-share="${championsEscape(match.home)} vs ${championsEscape(match.away)} · ${local.date}, ${local.time}">Compartir</button><a class="btn-link" href="${championsCalendarUrl(match)}" target="_blank" rel="noopener noreferrer">Añadir al calendario</a></div></article>`;}
function championsEmpty(title,text){return `<div class="score-empty"><span aria-hidden="true">⚽</span><h4>${title}</h4><p>${text}</p></div>`;}
function championsDrawOverview(){const draw=championsData.drawOpponents?.length?championsData.drawOpponents:(window.officialChampionsDraw||[]);return `<div class="champions-draw-grid">${draw.map(item=>`<article class="match-card champions-draw-card" data-team="${championsEscape(item.team)}"><h4>${championsEscape(item.team)}</h4><div class="champions-draw-side"><strong>En casa</strong><span>${item.home.map(championsEscape).join(" · ")}</span></div><div class="champions-draw-side"><strong>Fuera</strong><span>${item.away.map(championsEscape).join(" · ")}</span></div></article>`).join("")}</div>`;}
function championsCalendarUrl(match){const stamp=date=>date.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z/,"Z"),start=new Date(match.iso),end=new Date(start.getTime()+2*3600000);return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Champions · ${match.home} vs ${match.away}`)}&dates=${stamp(start)}/${stamp(end)}&details=${encodeURIComponent("UEFA Champions League · WOLFGAMES")}`;}
function renderChampionsBracket(){const bracket=document.getElementById("champions-bracket");bracket.hidden=!championsData.knockout.active;if(!championsData.knockout.active)return;const labels={playoff:"Play-off",last16:"Octavos",quarters:"Cuartos",semifinals:"Semifinales",final:"Final"};document.getElementById("champions-bracket-rounds").innerHTML=Object.entries(championsData.knockout.rounds).map(([key,ties])=>`<section class="bracket-round"><h4>${labels[key]}</h4>${ties.map(tie=>`<article><span>${championsEscape(tie.home)}</span><b>${tie.aggregate||"–"}</b><span>${championsEscape(tie.away)}</span></article>`).join("")}</section>`).join("");}
