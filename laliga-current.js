(()=>{
  if(typeof footballData==="undefined"||!footballData.laligaRounds)return;
  const updates={
    4:[
      ["Real Betis","Real Madrid",1,0,"Alejandro José Hernández Hernández"],
      ["Athletic Club","Atlético de Madrid",3,0,"José Luis Munuera Montero"],
      ["Rayo Vallecano","R. Racing Club",3,2,"Alejandro Quintero González"],
      ["Villarreal CF","RC Deportivo",2,3,"Jesús Gil Manzano"],
      ["Valencia CF","FC Barcelona",0,5,"Isidro Díaz de Mera Escuderos"],
      ["Deportivo Alavés","CA Osasuna",5,2,"José María Sánchez Martínez"],
      ["Málaga CF","Levante UD",0,0,"Luis Bestard Servera"],
      ["RCD Espanyol de Barcelona","Sevilla FC",1,1,"Miguel Sesma Espinosa"],
      ["Getafe CF","Celta",1,1,"César Soto Grado"],
      ["Elche CF","Real Sociedad",2,3,"Miguel Ángel Ortiz Arias"]
    ].map(([home,away,homeScore,awayScore,referee])=>({home,away,homeScore,awayScore,referee,state:"finished",status:"Finalizado"})),
    5:[
      ["2026-09-11T21:00:00+02:00","Viernes 11 de septiembre","21:00","Sevilla FC","Valencia CF","Ramón Sánchez-Pizjuán"],
      ["2026-09-12T14:00:00+02:00","Sábado 12 de septiembre","14:00","R. Racing Club","Deportivo Alavés","El Sardinero"],
      ["2026-09-12T16:15:00+02:00","Sábado 12 de septiembre","16:15","CA Osasuna","RCD Espanyol de Barcelona","El Sadar"],
      ["2026-09-12T18:30:00+02:00","Sábado 12 de septiembre","18:30","Athletic Club","Elche CF","San Mamés"],
      ["2026-09-12T21:00:00+02:00","Sábado 12 de septiembre","21:00","Real Madrid","Rayo Vallecano","Santiago Bernabéu"],
      ["2026-09-13T14:00:00+02:00","Domingo 13 de septiembre","14:00","Celta","Málaga CF","Abanca Balaídos"],
      ["2026-09-13T16:15:00+02:00","Domingo 13 de septiembre","16:15","Levante UD","FC Barcelona","Ciutat de València"],
      ["2026-09-13T18:30:00+02:00","Domingo 13 de septiembre","18:30","Getafe CF","RC Deportivo","Coliseum"],
      ["2026-09-13T21:00:00+02:00","Domingo 13 de septiembre","21:00","Real Sociedad","Atlético de Madrid","Reale Arena"],
      ["2026-09-14T21:00:00+02:00","Lunes 14 de septiembre","21:00","Villarreal CF","Real Betis","Estadio de la Cerámica"]
    ].map(([iso,date,time,home,away,venue])=>({iso,date,time,home,away,venue,state:"scheduled",status:"Programado",referee:"Pendiente de publicación oficial",var:"Pendiente de publicación oficial"}))
  };
  const merge=(round,items)=>{
    const current=footballData.laligaRounds[round]||[];
    items.forEach(update=>{
      const match=current.find(item=>item.home===update.home&&item.away===update.away);
      if(match)Object.assign(match,update);else current.push(update);
    });
    footballData.laligaRounds[round]=current;
  };
  merge(4,updates[4]);merge(5,updates[5]);
  footballData.updated="9 de septiembre de 2026 · jornadas 4 y 5 sincronizadas con LALIGA";
})();
