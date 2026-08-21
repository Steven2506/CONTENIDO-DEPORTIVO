const f1Races = [
  [1,"GP Australia","Albert Park","2026-03-06T12:00:00+11:00","6–8 MAR",null],
  [2,"GP China","Shanghai International Circuit","2026-03-13T12:00:00+08:00","13–15 MAR",null],
  [3,"GP Japón","Suzuka Circuit","2026-03-27T12:30:00+09:00","27–29 MAR","gps/suzuka.html"],
  [4,"GP Miami","Miami International Autodrome","2026-05-01T12:30:00-04:00","1–3 MAY","gps/miami.html"],
  [5,"GP Canadá","Circuit Gilles Villeneuve","2026-05-22T12:30:00-04:00","22–24 MAY","gps/canada.html"],
  [6,"GP Mónaco","Circuit de Monaco","2026-06-05T13:30:00+02:00","5–7 JUN","gps/monaco.html"],
  [7,"GP Barcelona-Catalunya","Circuit de Barcelona-Catalunya","2026-06-12T13:30:00+02:00","12–14 JUN","gps/barcelona.html"],
  [8,"GP Austria","Red Bull Ring","2026-06-26T13:30:00+02:00","26–28 JUN","gps/austria.html"],
  [9,"GP Gran Bretaña","Silverstone Circuit","2026-07-03T12:30:00+01:00","3–5 JUL","gps/silverstone.html"],
  [10,"GP Bélgica","Spa-Francorchamps","2026-07-17T13:30:00+02:00","17–19 JUL","gps/spa.html"],
  [11,"GP Hungría","Hungaroring","2026-07-24T13:30:00+02:00","24–26 JUL","gps/hungria.html"],
  [12,"GP Países Bajos","Circuit Zandvoort","2026-08-21T12:30:00+02:00","21–23 AGO","gps/holanda.html"],
  [13,"GP Italia","Autodromo Nazionale Monza","2026-09-04T12:30:00+02:00","4–6 SEP","gps/monza.html"],
  [14,"GP España","Madring","2026-09-11T13:30:00+02:00","11–13 SEP","gps/madrid.html"],
  [15,"GP Azerbaiyán","Baku City Circuit","2026-09-24T10:30:00+04:00","24–26 SEP","gps/baku.html"],
  [16,"GP Baréin","Circuito internacional de Sepang","2026-10-02T12:00:00+08:00","2–4 OCT",null],
  [17,"GP Singapur","Marina Bay Street Circuit","2026-10-09T10:30:00+08:00","9–11 OCT","gps/singapore.html"],
  [18,"GP Estados Unidos","Circuit of the Americas","2026-10-23T12:30:00-05:00","23–25 OCT","gps/cota.html"],
  [19,"GP México","Autódromo Hermanos Rodríguez","2026-10-30T12:30:00-06:00","30 OCT–1 NOV","gps/mexico.html"],
  [20,"GP São Paulo","Interlagos","2026-11-06T12:30:00-03:00","6–8 NOV","gps/brazil.html"],
  [21,"GP Las Vegas","Las Vegas Strip Circuit","2026-11-19T12:30:00-08:00","19–21 NOV","gps/vegas.html"],
  [22,"GP Qatar","Lusail International Circuit","2026-11-27T12:30:00+03:00","27–29 NOV","gps/qatar.html"],
  [23,"GP Abu Dhabi","Yas Marina Circuit","2026-12-04T12:30:00+04:00","4–6 DIC","gps/abudhabi.html"]
].map(([round,name,circuit,date,label,url])=>({round,name,circuit,date,label,url}));

function getNextRace(){const now=Date.now();return f1Races.find(r=>new Date(r.date).getTime()>now)||null;}
function formatCountdown(ms){if(ms<=0)return "🏁 En marcha";const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000);return d?`${d} d · ${h} h · ${m} min`:`${h} h · ${m} min`;}
function startCountdown(time,id){const el=document.getElementById(id);if(!el)return;const update=()=>el.textContent=formatCountdown(time-Date.now());update();setInterval(update,60000);}
function renderF1Calendar(id="f1-calendar"){
  const box=document.getElementById(id);if(!box)return;const next=getNextRace();
  box.innerHTML=f1Races.map(r=>{const past=new Date(r.date)<new Date(),isNext=next===r;const tag=r.url?"a":"article";const href=r.url?` href="${r.url}"`:"";return `<${tag}${href} class="race-card${past?" is-past":""}${isNext?" is-next":""}"><span class="race-round">ROUND ${r.round}</span>${isNext?'<span class="race-status">SIGUIENTE</span>':""}<h3>${r.name}</h3><p>${r.circuit}</p><p class="race-date">${r.label}</p></${tag}>`;}).join("");
}
