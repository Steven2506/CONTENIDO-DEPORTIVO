(()=>{
  if(typeof footballData==="undefined"||!footballData.laligaRounds)return;
  const officialRounds={
    5:[
      {date:"Viernes 11 de septiembre",time:"21:00",iso:"2026-09-11T21:00:00+02:00",home:"Sevilla FC",away:"Valencia CF",venue:"Ramón Sánchez-Pizjuán",status:"Finalizado",state:"finished",homeScore:1,awayScore:0,referee:"Mateo Busquets Ferrer",var:"Pendiente de publicación oficial"},
      {date:"Sábado 12 de septiembre",time:"14:00",iso:"2026-09-12T14:00:00+02:00",home:"R. Racing Club",away:"Deportivo Alavés",venue:"El Sardinero",status:"Finalizado",state:"finished",homeScore:2,awayScore:1,referee:"Javier Alberola Rojas",var:"Pendiente de publicación oficial"},
      {date:"Sábado 12 de septiembre",time:"16:15",iso:"2026-09-12T16:15:00+02:00",home:"CA Osasuna",away:"RCD Espanyol de Barcelona",venue:"El Sadar",status:"Finalizado",state:"finished",homeScore:0,awayScore:2,referee:"Luis Bestard Servera",var:"Pendiente de publicación oficial"},
      {date:"Sábado 12 de septiembre",time:"18:30",iso:"2026-09-12T18:30:00+02:00",home:"Athletic Club",away:"Elche CF",venue:"San Mamés",status:"Finalizado",state:"finished",homeScore:1,awayScore:1,referee:"Manuel Jesús Orellana Cid",var:"Pendiente de publicación oficial"},
      {date:"Sábado 12 de septiembre",time:"21:00",iso:"2026-09-12T21:00:00+02:00",home:"Real Madrid",away:"Rayo Vallecano",venue:"Santiago Bernabéu",status:"Finalizado",state:"finished",homeScore:4,awayScore:1,referee:"Víctor García Verdura",var:"Pendiente de publicación oficial"},
      {date:"Domingo 13 de septiembre",time:"14:00",iso:"2026-09-13T14:00:00+02:00",home:"Celta",away:"Málaga CF",venue:"Abanca Balaídos",status:"Programado",state:"scheduled",referee:"Muñiz Muñoz",var:"Pendiente de publicación oficial"},
      {date:"Domingo 13 de septiembre",time:"16:15",iso:"2026-09-13T16:15:00+02:00",home:"Levante UD",away:"FC Barcelona",venue:"Ciutat de València",status:"Programado",state:"scheduled",referee:"Jon Ander González Esteban",var:"Pendiente de publicación oficial"},
      {date:"Domingo 13 de septiembre",time:"18:30",iso:"2026-09-13T18:30:00+02:00",home:"Getafe CF",away:"RC Deportivo",venue:"Coliseum",status:"Programado",state:"scheduled",referee:"Ricardo de Burgos Bengoetxea",var:"Pendiente de publicación oficial"},
      {date:"Domingo 13 de septiembre",time:"21:00",iso:"2026-09-13T21:00:00+02:00",home:"Real Sociedad",away:"Atlético de Madrid",venue:"Reale Arena",status:"Programado",state:"scheduled",referee:"Juan Martínez Munuera",var:"Pendiente de publicación oficial"},
      {date:"Lunes 14 de septiembre",time:"21:00",iso:"2026-09-14T21:00:00+02:00",home:"Villarreal CF",away:"Real Betis",venue:"Estadio de la Cerámica",status:"Programado",state:"scheduled",referee:"Pendiente de publicación oficial",var:"Pendiente de publicación oficial"}
    ]
  };
  Object.entries(officialRounds).forEach(([round,matches])=>{
    const current=footballData.laligaRounds[round]||[];
    matches.forEach(update=>{
      const match=current.find(item=>item.home===update.home&&item.away===update.away);
      if(match)Object.assign(match,update);else current.push(update);
    });
    footballData.laligaRounds[round]=current;
  });
  footballData.updated="12 de septiembre de 2026 · jornada 5 sincronizada con LALIGA";
})();
