const championsState={round:1};

document.addEventListener("DOMContentLoaded",()=>{
  renderChampions();
  const selector=document.getElementById("champions-round-select");
  selector?.addEventListener("change",()=>{championsState.round=Number(selector.value);renderChampionsMatches();});
  updateChampionsCountdown();
  setInterval(updateChampionsCountdown,1000);
});

function championsEscape(value=""){return String(value).replace(/[&<>\"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"})[char]);}
function renderChampions(){
  document.getElementById("champions-updated").textContent=`Datos UEFA: ${championsData.updated}`;
  const selector=document.getElementById("champions-round-select");
  selector.innerHTML=championsData.rounds.map(item=>`<option value="${item.round}">Jornada ${item.round} · ${item.label}</option>`).join("");
  document.getElementById("champions-standing").innerHTML=`<table class="standing-table champions-standing-table"><thead><tr><th>Pos.</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>DG</th><th>PTS</th></tr></thead><tbody>${championsData.standings.map(row=>`<tr class="champions-zone-${row.pos<=8?"direct":row.pos<=24?"playoff":"out"}${row.pending?" pending-team":""}" data-team="${championsEscape(row.team)}"><td><b>${row.pos}</b></td><th scope="row">${championsEscape(row.team)}</th><td>${row.played}</td><td>${row.won}</td><td>${row.drawn}</td><td>${row.lost}</td><td>${row.gf}</td><td>${row.ga}</td><td>${row.gd>0?`+${row.gd}`:row.gd}</td><td><strong>${row.points}</strong></td></tr>`).join("")}</tbody></table>`;
  renderChampionsMatches();
  renderChampionsBracket();
  requestAnimationFrame(()=>window.applyTeamPreference?.());
}

function renderChampionsMatches(){
  const round=championsData.rounds.find(item=>item.round===championsState.round),box=document.getElementById("champions-matches"),title=document.getElementById("champions-round-title");
  title.textContent=`Jornada ${round.round} · ${round.label}`;
  box.innerHTML=round.matches.length?round.matches.map(championsMatchCard).join(""):`<div class="score-empty champions-waiting"><span aria-hidden="true">✦</span><h4>Emparejamientos pendientes del sorteo</h4><p>UEFA publicará rivales, fechas y horarios oficiales después del sorteo del 27 de agosto.</p></div>`;
}

function championsMatchCard(match){
  const finished=match.state==="finished",hasScore=Number.isInteger(match.homeScore)&&Number.isInteger(match.awayScore),calendar=match.iso?`<a class="btn-link" href="${championsCalendarUrl(match)}" target="_blank" rel="noopener noreferrer">Añadir al calendario</a>`:'<span class="calendar-pending">Horario pendiente</span>';
  return `<article class="match-card champions-match" data-teams="${championsEscape(match.home)}|${championsEscape(match.away)}"><div class="match-meta"><span>${championsEscape(match.date)} · ${championsEscape(match.time)}</span><span class="status ${finished?"finished":""}">${finished?"FINAL":championsEscape(match.time)}</span></div><div class="score-teams"><strong>${championsEscape(match.home)}</strong><span class="big-score">${hasScore?`${match.homeScore}<i>–</i>${match.awayScore}`:"VS"}</span><strong>${championsEscape(match.away)}</strong></div><div class="card-actions">${calendar}</div></article>`;
}

function championsCalendarUrl(match){const stamp=date=>date.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z/,"Z"),start=new Date(match.iso),end=new Date(start.getTime()+2*3600000);return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Champions · ${match.home} vs ${match.away}`)}&dates=${stamp(start)}/${stamp(end)}&details=${encodeURIComponent("UEFA Champions League · WOLFGAMES")}`;}

function updateChampionsCountdown(){
  const box=document.getElementById("champions-countdown");if(!box)return;
  const remaining=new Date(championsData.drawIso).getTime()-Date.now();
  if(remaining<=0){box.textContent="Sorteo celebrado · esperando calendario oficial";return;}
  const days=Math.floor(remaining/86400000),hours=Math.floor(remaining%86400000/3600000),minutes=Math.floor(remaining%3600000/60000),seconds=Math.floor(remaining%60000/1000);
  box.textContent=`${days} d · ${hours} h · ${minutes} min · ${seconds} s`;
}

function renderChampionsBracket(){
  const bracket=document.getElementById("champions-bracket");
  bracket.hidden=!championsData.knockout.active;
  if(!championsData.knockout.active)return;
  const labels={playoff:"Play-off",last16:"Octavos",quarters:"Cuartos",semifinals:"Semifinales",final:"Final"};
  document.getElementById("champions-bracket-rounds").innerHTML=Object.entries(championsData.knockout.rounds).map(([key,ties])=>`<section class="bracket-round"><h4>${labels[key]}</h4>${ties.map(tie=>`<article><span>${championsEscape(tie.home)}</span><b>${tie.aggregate||"–"}</b><span>${championsEscape(tie.away)}</span></article>`).join("")}</section>`).join("");
}
