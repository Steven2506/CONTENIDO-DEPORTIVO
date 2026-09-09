window.officialChampionsDraw=`Paris|Barcelona,Roma,Galatasaray,S. Bratislava|Man City,Aston Villa,Villarreal,Como
Bayern München|Arsenal,Real Betis,Bodø/Glimt,Slavia Praha|Atleti,Man Utd,Lille,Viking
Real Madrid|Inter,PSV,Leipzig,LASK|Arsenal,Roma,Shakhtar,AEK Athens
Liverpool|Atleti,Porto,Villarreal,Lens|Inter,Club Brugge,Fenerbahçe,LASK
Inter|Liverpool,Club Brugge,Shakhtar,Stuttgart|Real Madrid,B. Dortmund,Feyenoord,S. Bratislava
Man City|Paris,Sporting CP,Napoli,AEK Athens|Barcelona,Porto,Leipzig,Lens
Arsenal|Real Madrid,B. Dortmund,Lille,Sabah|Bayern München,Real Betis,Napoli,Slavia Praha
Barcelona|Man City,Aston Villa,Feyenoord,Como|Paris,Sporting CP,Galatasaray,Sabah
Atleti|Bayern München,Man Utd,Fenerbahçe,Viking|Liverpool,PSV,Bodø/Glimt,Stuttgart
B. Dortmund|Inter,Real Betis,Villarreal,AEK Athens|Arsenal,Aston Villa,Bodø/Glimt,Sabah
Roma|Real Madrid,Sporting CP,Lille,S. Bratislava|Paris,Man Utd,Fenerbahçe,AEK Athens
Sporting CP|Barcelona,Man Utd,Galatasaray,LASK|Man City,Roma,Shakhtar,Lens
Aston Villa|Paris,B. Dortmund,Fenerbahçe,Viking|Barcelona,Club Brugge,Galatasaray,Slavia Praha
Porto|Man City,PSV,Napoli,Slavia Praha|Liverpool,Real Betis,Feyenoord,LASK
Man Utd|Bayern München,Roma,Leipzig,Sabah|Atleti,Sporting CP,Villarreal,Como
Club Brugge|Liverpool,Aston Villa,Bodø/Glimt,Lens|Inter,PSV,Napoli,Stuttgart
Real Betis|Arsenal,Porto,Feyenoord,Como|Bayern München,B. Dortmund,Lille,S. Bratislava
PSV|Atleti,Club Brugge,Shakhtar,Stuttgart|Real Madrid,Porto,Leipzig,Viking
Feyenoord|Inter,Porto,Leipzig,Como|Barcelona,Real Betis,Galatasaray,Viking
Lille|Bayern München,Real Betis,Galatasaray,S. Bratislava|Arsenal,Roma,Bodø/Glimt,Stuttgart
Bodø/Glimt|Atleti,B. Dortmund,Lille,LASK|Bayern München,Club Brugge,Napoli,Lens
Napoli|Arsenal,Club Brugge,Bodø/Glimt,Viking|Man City,Porto,Villarreal,Sabah
Leipzig|Man City,PSV,Shakhtar,Lens|Real Madrid,Man Utd,Feyenoord,Como
Villarreal|Paris,Man Utd,Napoli,Sabah|Liverpool,B. Dortmund,Fenerbahçe,Slavia Praha
Fenerbahçe|Liverpool,Roma,Villarreal,Slavia Praha|Atleti,Aston Villa,Shakhtar,LASK
Shakhtar|Real Madrid,Sporting CP,Fenerbahçe,AEK Athens|Inter,PSV,Leipzig,S. Bratislava
Galatasaray|Barcelona,Aston Villa,Feyenoord,Stuttgart|Paris,Sporting CP,Lille,AEK Athens
Slavia Praha|Arsenal,Aston Villa,Villarreal,Lens|Bayern München,Porto,Fenerbahçe,Sabah
S. Bratislava|Inter,Real Betis,Shakhtar,Stuttgart|Paris,Roma,Lille,LASK
Stuttgart|Atleti,Club Brugge,Lille,Viking|Inter,PSV,Galatasaray,S. Bratislava
AEK Athens|Real Madrid,Roma,Galatasaray,LASK|Man City,B. Dortmund,Shakhtar,Como
LASK|Liverpool,Porto,Fenerbahçe,S. Bratislava|Real Madrid,Sporting CP,Bodø/Glimt,AEK Athens
Como|Paris,Man Utd,Leipzig,AEK Athens|Barcelona,Real Betis,Feyenoord,Lens
Lens|Man City,Sporting CP,Bodø/Glimt,Como|Liverpool,Club Brugge,Leipzig,Slavia Praha
Viking|Bayern München,PSV,Feyenoord,Sabah|Atleti,Aston Villa,Napoli,Stuttgart
Sabah|Barcelona,B. Dortmund,Napoli,Slavia Praha|Arsenal,Man Utd,Villarreal,Viking`.trim().split("\n").map(line=>{const [team,home,away]=line.split("|");return{team,home:home.split(","),away:away.split(",")};});


const officialChampionsFixtures=[
{round:1,home:"AEK Athens",away:"LASK",iso:"2026-09-08T18:45:00+02:00",state:"finished",homeScore:1,awayScore:0},
{round:1,home:"Club Brugge",away:"Aston Villa",iso:"2026-09-08T18:45:00+02:00",state:"finished",homeScore:2,awayScore:3},
{round:1,home:"B. Dortmund",away:"Villarreal",iso:"2026-09-08T21:00:00+02:00",state:"scheduled"},
{round:1,home:"Porto",away:"Man City",iso:"2026-09-08T21:00:00+02:00",state:"scheduled"},
{round:1,home:"Lille",away:"Real Betis",iso:"2026-09-08T21:00:00+02:00",state:"scheduled"},
{round:1,home:"Real Madrid",away:"Inter",iso:"2026-09-08T21:00:00+02:00",state:"scheduled"},
{round:1,home:"Barcelona",away:"Feyenoord",iso:"2026-09-09T18:45:00+02:00",state:"scheduled"},
{round:1,home:"Stuttgart",away:"Viking",iso:"2026-09-09T18:45:00+02:00",state:"scheduled"},
{round:1,home:"Liverpool",away:"Atleti",iso:"2026-09-09T21:00:00+02:00",state:"scheduled"},
{round:1,home:"Paris",away:"S. Bratislava",iso:"2026-09-09T21:00:00+02:00",state:"scheduled"},
{round:1,home:"Sporting CP",away:"Galatasaray",iso:"2026-09-09T21:00:00+02:00",state:"scheduled"},
{round:1,home:"Napoli",away:"Arsenal",iso:"2026-09-09T21:00:00+02:00",state:"scheduled"},
{round:1,home:"Fenerbahçe",away:"Roma",iso:"2026-09-10T18:45:00+02:00",state:"scheduled"},
{round:1,home:"PSV",away:"Shakhtar",iso:"2026-09-10T18:45:00+02:00",state:"scheduled"},
{round:1,home:"Como",away:"Leipzig",iso:"2026-09-10T21:00:00+02:00",state:"scheduled"},
{round:1,home:"Bayern München",away:"Bodø/Glimt",iso:"2026-09-10T21:00:00+02:00",state:"scheduled"},
{round:1,home:"Man Utd",away:"Sabah",iso:"2026-09-10T21:00:00+02:00",state:"scheduled"},
{round:1,home:"Slavia Praha",away:"Lens",iso:"2026-09-10T21:00:00+02:00",state:"scheduled"}
];
officialChampionsFixtures.forEach(match=>{const round=championsData.rounds.find(item=>item.round===match.round);if(round&&!round.matches.some(item=>item.home===match.home&&item.away===match.away))round.matches.push(match);});


document.addEventListener("DOMContentLoaded",()=>{
  const section=document.querySelector(".champions-centre");if(!section)return;
  section.classList.add("football-centre");
  section.innerHTML=`
<div class="scoreboard-heading champions-heading"><div><p class="eyebrow">UEFA Champions League · 2026/27</p><h2>Centro de resultados</h2><p id="champions-updated"></p><p class="timezone-note">🕒 Horarios adaptados a tu zona</p></div><div class="live-connection"><span class="connection-dot" aria-hidden="true"></span><span><strong>Datos UEFA sincronizados</strong><small>Partidos, resultados y clasificación</small></span></div></div>
<div class="score-strip" id="champions-score-strip" aria-label="Resumen de partidos de Champions"></div>
<div class="football-view-tabs champions-view-tabs" role="tablist" aria-label="Vistas de Champions"><button class="view-button active" data-champions-view="matches" role="tab" aria-selected="true">Partidos</button><button class="view-button" data-champions-view="live" role="tab" aria-selected="false"><span class="live-dot" aria-hidden="true"></span> En directo <span id="champions-live-count" class="view-count">0</span></button><button class="view-button" data-champions-view="results" role="tab" aria-selected="false">Resultados</button><button class="view-button" data-champions-view="standing" role="tab" aria-selected="false">Clasificación</button><button class="view-button" data-champions-view="draw" role="tab" aria-selected="false">Sorteo</button></div>
<div data-champions-panel="matches"><div class="panel-header"><div><h3>Todos los partidos</h3><p>La jornada completa, con horarios locales y acceso al calendario.</p></div><label class="round-picker" for="champions-round-select"><span>Seleccionar jornada</span><select id="champions-round-select"></select></label></div><div class="round-summary"><h3 id="champions-round-title">Jornada</h3><a class="text-link" href="https://www.uefa.com/uefachampionsleague/fixtures-results/" target="_blank" rel="noopener noreferrer">Comprobar en UEFA →</a></div><div id="champions-matches" class="match-list full-round-grid"></div></div>
<div data-champions-panel="live" hidden><div class="view-heading"><div><p class="eyebrow">Ahora mismo</p><h3>Partidos en directo</h3></div></div><div id="champions-live-matches" class="match-list live-results-grid"></div></div>
<div data-champions-panel="results" hidden><div class="view-heading"><div><p class="eyebrow">Marcadores definitivos</p><h3>Resultados de la jornada</h3></div></div><div id="champions-results" class="match-list live-results-grid"></div></div>
<div data-champions-panel="standing" hidden><article class="mini-standing standalone-standing"><h3>Clasificación de la fase de liga</h3><p>1–8 pasan a octavos; 9–24 disputan el play-off.</p><div class="champions-legend"><span class="direct">1–8 · Octavos</span><span class="playoff">9–24 · Play-off</span><span class="out">25–36 · Eliminados</span></div><div id="champions-standing" class="compact-standing"></div></article></div>
<div data-champions-panel="draw" hidden><div class="view-heading"><div><p class="eyebrow">Sorteo oficial</p><h3>Ocho rivales por equipo</h3></div><strong id="champions-countdown">36 equipos confirmados</strong></div><div id="champions-draw-overview"></div></div>
<section id="champions-bracket" class="champions-bracket" hidden><div class="bracket-title"><p class="eyebrow">Camino a Madrid 2027</p><h3>Fase eliminatoria</h3></div><div class="trophy-stage" aria-hidden="true"><span>🏆</span><strong>CHAMPIONS</strong><small>Final · Estadio Metropolitano</small></div><div id="champions-bracket-rounds" class="bracket-rounds"></div></section>`;
});

