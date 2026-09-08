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
