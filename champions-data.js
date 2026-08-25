const championsData={
  updated:"25 de agosto de 2026 · estructura previa al sorteo",
  phase:"pre-draw",
  drawIso:"2026-08-27T18:00:00+02:00",
  fixturesDeadlineIso:"2026-08-29T23:59:00+02:00",
  standings:[
    "Arsenal","Aston Villa","Atlético de Madrid","Borussia Dortmund","FC Barcelona","Bayern München","Club Brugge","Como","Feyenoord","Galatasaray","Inter","RB Leipzig","Lens","Lille","Liverpool","Manchester City","Manchester United","Napoli","Paris Saint-Germain","Porto","PSV","Real Betis","Real Madrid","Roma","Shakhtar Donetsk","Slavia Praha","Sporting CP","Stuttgart","Villarreal",
    "Clasificado del play-off 1","Clasificado del play-off 2","Clasificado del play-off 3","Clasificado del play-off 4","Clasificado del play-off 5","Clasificado del play-off 6","Clasificado del play-off 7"
  ].map((team,index)=>({pos:index+1,team,played:0,won:0,drawn:0,lost:0,gf:0,ga:0,gd:0,points:0,pending:index>=29})),
  rounds:[
    {round:1,label:"8–10 septiembre 2026",matches:[]},
    {round:2,label:"13–14 octubre 2026",matches:[]},
    {round:3,label:"20–21 octubre 2026",matches:[]},
    {round:4,label:"3–4 noviembre 2026",matches:[]},
    {round:5,label:"24–25 noviembre 2026",matches:[]},
    {round:6,label:"8–9 diciembre 2026",matches:[]},
    {round:7,label:"19–20 enero 2027",matches:[]},
    {round:8,label:"27 enero 2027",matches:[]}
  ],
  knockout:{active:false,rounds:{playoff:[],last16:[],quarters:[],semifinals:[],final:[]}}
};
