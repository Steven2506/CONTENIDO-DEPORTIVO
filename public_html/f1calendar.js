/* =========================
   CALENDARIO F1 2026
========================= */

const f1Races = [

{
name: "GP Japón",
circuit: "Suzuka Circuit",
date: "2026-03-27T03:30:00"
},

{
name: "GP Miami",
circuit: "Miami International Autodrome",
date: "2026-05-01T18:30:00"
},

{
name: "GP Canadá",
circuit: "Circuit Gilles Villeneuve",
date: "2026-05-22T18:30:00"
},

{
name: "GP Mónaco",
circuit: "Circuit de Monaco",
date: "2026-06-05T13:30:00"
},

{
name: "GP Barcelona",
circuit: "Circuit de Barcelona-Catalunya",
date: "2026-06-12T13:30:00"
},

{
name: "GP Austria",
circuit: "Red Bull Ring",
date: "2026-06-26T13:30:00"
},

{
name: "GP Gran Bretaña",
circuit: "Silverstone Circuit",
date: "2026-07-03T13:30:00"
},

{
name: "GP Bélgica",
circuit: "Spa-Francorchamps",
date: "2026-07-17T13:30:00"
},

{
name: "GP Hungría",
circuit: "Hungaroring",
date: "2026-07-24T13:30:00"
},

{
name: "GP Holanda",
circuit: "Zandvoort",
date: "2026-08-21T12:30:00"
},

{
name: "GP Italia",
circuit: "Monza",
date: "2026-09-04T12:30:00"
},

{
name: "GP España",
circuit: "Madrid Street Circuit",
date: "2026-09-11T13:30:00"
},

{
name: "GP Azerbaiyán",
circuit: "Baku City Circuit",
date: "2026-09-24T10:30:00"
},

{
name: "GP Singapur",
circuit: "Marina Bay Circuit",
date: "2026-10-09T10:30:00"
},

{
name: "GP EEUU",
circuit: "Circuit of the Americas",
date: "2026-10-23T19:30:00"
},

{
name: "GP México",
circuit: "Autódromo Hermanos Rodríguez",
date: "2026-10-30T19:30:00"
},

{
name: "GP Brasil",
circuit: "Interlagos",
date: "2026-11-06T16:30:00"
},

{
name: "GP Las Vegas",
circuit: "Las Vegas Strip Circuit",
date: "2026-11-19T01:30:00"
},

{
name: "GP Qatar",
circuit: "Lusail Circuit",
date: "2026-11-27T14:30:00"
},

{
name: "GP Abu Dhabi",
circuit: "Yas Marina Circuit",
date: "2026-12-04T10:30:00"
}

];


/* =========================
   BUSCAR PRÓXIMA CARRERA
========================= */

function getNextRace(){

const now = new Date().getTime();

for(let race of f1Races){

let raceTime = new Date(race.date).getTime();

if(raceTime > now){
return race;
}

}

return null;

}


/* =========================
   FORMATO BONITO
========================= */

function formatCountdown(distance){

const days = Math.floor(distance / (1000 * 60 * 60 * 24));

const hours = Math.floor(
(distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
);

const minutes = Math.floor(
(distance % (1000 * 60 * 60)) / (1000 * 60)
);

if(days > 0){
return days + " día" + (days > 1 ? "s" : "") + " · " +
hours + " h · " +
minutes + " min";
}

if(hours > 0){
return hours + " h · " + minutes + " min";
}

return minutes + " min";

}


/* =========================
   CONTADOR
========================= */

function startCountdown(raceTime, elementId){

const element = document.getElementById(elementId);

function update(){

const now = new Date().getTime();
const distance = raceTime - now;

if(distance <= 0){
element.innerHTML = "🏁 ¡En marcha!";
return;
}

element.innerHTML = formatCountdown(distance);

}

update();

setInterval(update, 60000);

}