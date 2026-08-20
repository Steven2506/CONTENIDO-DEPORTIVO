/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

/* ================================
   CALENDARIO MOTOGP 2026
   usado por el widget del index
================================ */

const motogpCalendar = [

{
name:"GP Brasil 🇧🇷",
circuit:"Goiânia",
date:"2026-03-20T15:05:00"
},

{
name:"GP Americas 🇺🇸",
circuit:"Circuit of the Americas",
date:"2026-03-27T16:45:00"
},

{
name:"GP España 🇪🇸",
circuit:"Jerez",
date:"2026-04-24T09:45:00"
},

{
name:"GP Francia 🇫🇷",
circuit:"Le Mans",
date:"2026-05-08T09:45:00"
},

{
name:"GP Cataluña 🇪🇸",
circuit:"Barcelona",
date:"2026-05-15T09:45:00"
},

{
name:"GP Italia 🇮🇹",
circuit:"Mugello",
date:"2026-05-29T09:45:00"
},

{
name:"GP Hungría 🇭🇺",
circuit:"Balaton Park",
date:"2026-06-05T09:45:00"
},

{
name:"GP Chequia 🇨🇿",
circuit:"Brno",
date:"2026-06-19T09:45:00"
},

{
name:"GP Países Bajos 🇳🇱",
circuit:"Assen",
date:"2026-06-26T09:45:00"
},

{
name:"GP Alemania 🇩🇪",
circuit:"Sachsenring",
date:"2026-07-10T09:45:00"
},

{
name:"GP Gran Bretaña 🇬🇧",
circuit:"Silverstone",
date:"2026-08-07T09:45:00"
},

{
name:"GP Aragón 🇪🇸",
circuit:"Motorland",
date:"2026-08-28T09:45:00"
},

{
name:"GP San Marino 🇸🇲",
circuit:"Misano",
date:"2026-09-11T09:45:00"
},

{
name:"GP Austria 🇦🇹",
circuit:"Red Bull Ring",
date:"2026-09-18T09:45:00"
},

{
name:"GP Japón 🇯🇵",
circuit:"Motegi",
date:"2026-10-02T09:45:00"
},

{
name:"GP Indonesia 🇮🇩",
circuit:"Mandalika",
date:"2026-10-09T09:45:00"
},

{
name:"GP Australia 🇦🇺",
circuit:"Phillip Island",
date:"2026-10-16T09:45:00"
},

{
name:"GP Malasia 🇲🇾",
circuit:"Sepang",
date:"2026-10-23T09:45:00"
},

{
name:"GP Portugal 🇵🇹",
circuit:"Portimão",
date:"2026-11-06T09:45:00"
},

{
name:"GP Qatar 🇶🇦",
circuit:"Losail",
date:"2026-11-08T09:45:00"
},

{
name:"GP Valencia 🇪🇸",
circuit:"Ricardo Tormo",
date:"2026-11-20T09:45:00"
}

];


/* ================================
   DETECTAR SIGUIENTE GP
================================ */

function getNextMotoGP(){

const now = new Date().getTime();

for(let race of motogpCalendar){

const time = new Date(race.date).getTime();

if(time > now){

return race;

}

}

return null;

}


/* ================================
   COUNTDOWN
================================ */

function startMotoCountdown(target,element){

setInterval(()=>{

const now = new Date().getTime();
const diff = target-now;

const d=Math.floor(diff/(1000*60*60*24));
const h=Math.floor((diff%(1000*60*60*24))/(1000*60*60));
const m=Math.floor((diff%(1000*60*60))/(1000*60));

document.getElementById(element).innerHTML =
d+"d "+h+"h "+m+"m";

},1000);

}