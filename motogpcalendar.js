const motogpCalendar = [
  ["GP Tailandia 🇹🇭","Chang International Circuit","2026-02-27T09:00:00+07:00","27 FEB–1 MAR"],
  ["GP Brasil 🇧🇷","Goiânia","2026-03-20T09:00:00-03:00","20–22 MAR"],
  ["GP Americas 🇺🇸","Circuit of the Americas","2026-03-27T09:00:00-05:00","27–29 MAR"],
  ["GP España 🇪🇸","Jerez","2026-04-24T09:00:00+02:00","24–26 ABR"],
  ["GP Francia 🇫🇷","Le Mans","2026-05-08T09:00:00+02:00","8–10 MAY"],
  ["GP Cataluña 🇪🇸","Barcelona","2026-05-15T09:00:00+02:00","15–17 MAY"],
  ["GP Italia 🇮🇹","Mugello","2026-05-29T09:00:00+02:00","29–31 MAY"],
  ["GP Hungría 🇭🇺","Balaton Park","2026-06-05T09:00:00+02:00","5–7 JUN"],
  ["GP Chequia 🇨🇿","Brno","2026-06-19T09:00:00+02:00","19–21 JUN"],
  ["GP Países Bajos 🇳🇱","Assen","2026-06-26T09:00:00+02:00","26–28 JUN"],
  ["GP Alemania 🇩🇪","Sachsenring","2026-07-10T09:00:00+02:00","10–12 JUL"],
  ["GP Gran Bretaña 🇬🇧","Silverstone","2026-08-07T09:00:00+01:00","7–9 AGO"],
  ["GP Aragón 🇪🇸","MotorLand Aragón","2026-08-28T09:00:00+02:00","28–30 AGO"],
  ["GP San Marino 🇸🇲","Misano","2026-09-11T09:00:00+02:00","11–13 SEP"],
  ["GP Austria 🇦🇹","Red Bull Ring","2026-09-18T09:00:00+02:00","18–20 SEP"],
  ["GP Japón 🇯🇵","Motegi","2026-10-02T09:00:00+09:00","2–4 OCT"],
  ["GP Indonesia 🇮🇩","Mandalika","2026-10-09T09:00:00+08:00","9–11 OCT"],
  ["GP Australia 🇦🇺","Phillip Island","2026-10-22T09:00:00+11:00","22–25 OCT"],
  ["GP Malasia 🇲🇾","Sepang","2026-10-30T09:00:00+08:00","30 OCT–1 NOV"],
  ["GP Qatar 🇶🇦","Lusail","2026-11-06T09:00:00+03:00","6–8 NOV"],
  ["GP Portugal 🇵🇹","Portimão","2026-11-20T09:00:00+00:00","20–22 NOV"],
  ["GP Valencia 🇪🇸","Ricardo Tormo","2026-11-27T09:00:00+01:00","27–29 NOV"]
].map(([name,circuit,date,label],i)=>({round:i+1,name,circuit,date,label}));
function getNextMotoGP(){return motogpCalendar.find(r=>new Date(r.date).getTime()>Date.now())||null;}
function startMotoCountdown(time,id){const el=document.getElementById(id);if(!el)return;const update=()=>{const ms=time-Date.now();if(ms<=0){el.textContent="🏁 En marcha";return;}const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000);el.textContent=`${d} d · ${h} h · ${m} min`;};update();setInterval(update,60000);}
function renderMotoCalendar(id="motogp-calendar"){
  const box=document.getElementById(id);if(!box)return;const next=getNextMotoGP();
  box.innerHTML=motogpCalendar.map(r=>{const past=new Date(r.date)<new Date(),isNext=next===r;return `<article class="race-card${past?" is-past":""}${isNext?" is-next":""}"><span class="race-round">ROUND ${r.round}</span>${isNext?'<span class="race-status">SIGUIENTE</span>':""}<h3>${r.name}</h3><p>${r.circuit}</p><p class="race-date">${r.label}</p></article>`;}).join("");
}
