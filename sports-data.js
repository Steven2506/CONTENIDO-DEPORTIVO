const footballData={
  updated:"21 de agosto de 2026 · horarios verificados con LaLiga",
  timezone:"Hora peninsular española (CEST, UTC+2)",
  currentRound:2,
  laligaRounds:{
    2:[
      {date:"Jueves 20 de agosto",time:"21:00",iso:"2026-08-20T21:00:00+02:00",home:"Rayo Vallecano",away:"Deportivo Alavés",venue:"Butarque",status:"Finalizado",state:"finished",homeScore:null,awayScore:null,referee:null,var:null},
      {date:"Viernes 21 de agosto",time:"21:00",iso:"2026-08-21T21:00:00+02:00",home:"Real Betis",away:"Real Sociedad",venue:"La Cartuja",status:"Próximo",referee:null,var:null},
      {date:"Sábado 22 de agosto",time:"17:00",iso:"2026-08-22T17:00:00+02:00",home:"Athletic Club",away:"Sevilla FC",venue:"San Mamés",status:"Próximo",referee:null,var:null},
      {date:"Sábado 22 de agosto",time:"19:30",iso:"2026-08-22T19:30:00+02:00",home:"Valencia CF",away:"Celta",venue:"Mestalla",status:"Próximo",referee:null,var:null},
      {date:"Sábado 22 de agosto",time:"21:30",iso:"2026-08-22T21:30:00+02:00",home:"RCD Espanyol de Barcelona",away:"Real Madrid",venue:"RCDE Stadium",status:"Próximo",referee:null,var:null},
      {date:"Domingo 23 de agosto",time:"17:00",iso:"2026-08-23T17:00:00+02:00",home:"Atlético de Madrid",away:"Villarreal CF",venue:"Riyadh Air Metropolitano",status:"Próximo",referee:null,var:null},
      {date:"Domingo 23 de agosto",time:"19:30",iso:"2026-08-23T19:30:00+02:00",home:"Getafe CF",away:"R. Racing Club",venue:"Coliseum",status:"Próximo",referee:null,var:null},
      {date:"Domingo 23 de agosto",time:"21:30",iso:"2026-08-23T21:30:00+02:00",home:"Elche CF",away:"FC Barcelona",venue:"Martínez Valero",status:"Próximo",referee:null,var:null},
      {date:"Lunes 24 de agosto",time:"19:30",iso:"2026-08-24T19:30:00+02:00",home:"CA Osasuna",away:"Levante UD",venue:"El Sadar",status:"Próximo",referee:null,var:null},
      {date:"Lunes 24 de agosto",time:"21:30",iso:"2026-08-24T21:30:00+02:00",home:"Málaga CF",away:"RC Deportivo",venue:"La Rosaleda",status:"Próximo",referee:null,var:null}
    ]
  },
  standingsNote:"Clasificación provisional. Se mantiene el enlace a la tabla oficial actualizada al segundo.",
  laligaStandings:[[1,"RCD Espanyol de Barcelona",3],[2,"Deportivo Alavés",3],[3,"Sevilla FC",3],[4,"R. Racing Club",1],[5,"Villarreal CF",1],[6,"RC Deportivo",1],[7,"Elche CF",1],[8,"Athletic Club",0],[9,"FC Barcelona",0],[10,"Real Madrid",0],[11,"Atlético de Madrid",0],[12,"Real Betis",0],[13,"Real Sociedad",0],[14,"Valencia CF",0],[15,"CA Osasuna",0],[16,"Celta",0],[17,"Málaga CF",0],[18,"Rayo Vallecano",0],[19,"Levante UD",0],[20,"Getafe CF",0]].map(([pos,team,points])=>({pos,team,points})),
  champions:{draw:"27 de agosto de 2026 · 18:00 CET",rounds:["Jornada 1 · 8–10 septiembre 2026","Jornada 2 · 13–14 octubre 2026","Jornada 3 · 20–21 octubre 2026","Jornada 4 · 3–4 noviembre 2026","Jornada 5 · 24–25 noviembre 2026","Jornada 6 · 8–9 diciembre 2026","Jornada 7 · 19–20 enero 2027","Jornada 8 · 27 enero 2027"]},
  f1Standings:[{pos:1,name:"Kimi Antonelli",team:"Mercedes",points:219},{pos:2,name:"Lewis Hamilton",team:"Ferrari",points:169},{pos:3,name:"George Russell",team:"Mercedes",points:160},{pos:4,name:"Charles Leclerc",team:"Ferrari",points:138},{pos:5,name:"Lando Norris",team:"McLaren",points:128}],
  latest:{f1:"GP Hungría: clasificación y resultados disponibles en F1.com",motogp:"GP Gran Bretaña: resultados disponibles en MotoGP.com",football:"LaLiga 2026/27 ya está en marcha"}
};
