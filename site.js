const WolfTimezone=(()=>{
  const storageKey="wolf-timezone";
  const detected=(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||"Europe/Madrid";}catch{return "Europe/Madrid";}})();
  const zones=[
    ["Europe/Madrid","España peninsular"],["Atlantic/Canary","Islas Canarias"],["Europe/London","Reino Unido"],["Europe/Lisbon","Portugal"],
    ["Europe/Paris","Francia"],["Europe/Berlin","Alemania"],["Europe/Rome","Italia"],["America/New_York","EE. UU. · Este"],
    ["America/Chicago","EE. UU. · Centro"],["America/Denver","EE. UU. · Montaña"],["America/Los_Angeles","EE. UU. · Pacífico"],
    ["America/Mexico_City","México"],["America/Bogota","Colombia"],["America/Lima","Perú"],["America/Argentina/Buenos_Aires","Argentina"],
    ["America/Sao_Paulo","Brasil · São Paulo"],["America/Santiago","Chile"],["America/Caracas","Venezuela"],["America/Guayaquil","Ecuador"],["America/La_Paz","Bolivia"],["America/Montevideo","Uruguay"],["America/Asuncion","Paraguay"],["America/Costa_Rica","Costa Rica"],["America/Guatemala","Guatemala"],["America/Santo_Domingo","República Dominicana"],["Asia/Tokyo","Japón"],["Asia/Shanghai","China"],["Asia/Kolkata","India"],["Australia/Sydney","Australia · Sídney"]
  ];
  const valid=zone=>{try{new Intl.DateTimeFormat("es-ES",{timeZone:zone}).format();return true;}catch{return false;}};
  const saved=localStorage.getItem(storageKey),current=valid(saved)?saved:detected;
  const offset=zone=>{try{return new Intl.DateTimeFormat("es-ES",{timeZone:zone,timeZoneName:"shortOffset"}).formatToParts(new Date()).find(part=>part.type==="timeZoneName")?.value||zone;}catch{return zone;}};
  const name=zone=>zones.find(item=>item[0]===zone)?.[1]||zone.replaceAll("_"," ").split("/").pop();
  const get=()=>{const value=localStorage.getItem(storageKey);return valid(value)?value:current;};
  const set=zone=>{if(valid(zone)){localStorage.setItem(storageKey,zone);location.reload();}};
  const format=(value,options={})=>new Intl.DateTimeFormat("es-ES",{...options,timeZone:get()}).format(new Date(value));
  return {detected,zones,valid,get,set,format,offset,name,hasSaved:()=>Boolean(localStorage.getItem(storageKey))};
})();
window.WolfTimezone=WolfTimezone;

(() => {
  const root = document.body.dataset.root || "";
  const preferences = document.createElement("script");
  preferences.src = `${root}preferences.js?v=20260913-teams2`;
  preferences.defer = true;
  document.head.append(preferences);
  if (!document.querySelector('link[rel="icon"]')) {
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/svg+xml";
    favicon.href = `${root}favicon.svg`;
    document.head.append(favicon);
  }
  const links = [
    ["index.html", "INICIO"], ["directos.html", "CONTENIDO"], ["deportes.html", "FÚTBOL"],
    ["F1.html", "F1"], ["MotoGP.html", "MOTOGP"], ["sobremi.html", "SOBRE MÍ"]
  ];
  const current = location.pathname.split("/").pop() || "index.html";
  const header = document.querySelector("[data-site-header]");
  if (header) {
    const title = header.dataset.title || "WOLFGAMES";
    const menuLinks = links.map(([href, label]) => {
      const active = current.toLowerCase() === href.toLowerCase();
      return `<li><a href="${root}${href}"${active ? ' class="active" aria-current="page"' : ""}>${label}</a></li>`;
    }).join("");
    header.innerHTML = `<header class="site-header">
      <a class="brand" href="${root}index.html" aria-label="WOLFGAMES, inicio"><span class="brand-mark">WG</span><span>${title}</span></a>
      <button class="timezone-button" type="button" aria-label="Cambiar zona horaria. Actual: ${WolfTimezone.name(WolfTimezone.get())}">🌍 <span>${WolfTimezone.name(WolfTimezone.get())}</span></button>
      <button class="notification-button" type="button" aria-label="Configurar notificaciones" aria-haspopup="dialog">🔔<span class="notification-dot" aria-hidden="true"></span></button>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-menu"><span aria-hidden="true">☰</span><span class="sr-only">Abrir menú</span></button>
      <nav class="navbar" aria-label="Navegación principal"><ul class="menu" id="main-menu">${menuLinks}</ul></nav>
    </header>`;
    const button = header.querySelector(".menu-toggle");
    const menu = header.querySelector(".menu");
    button?.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("open", !open);
    });
  }
  const zoneStyle=document.createElement("style");
  zoneStyle.textContent=`.timezone-button{border:1px solid #8845b8;background:#180522;color:#fff;border-radius:999px;padding:.55rem .8rem;cursor:pointer;font:inherit;display:flex;gap:.4rem;align-items:center}.timezone-dialog{border:1px solid #a200ff;border-radius:18px;background:#120018;color:#fff;max-width:520px;width:calc(100% - 2rem);padding:1.4rem;box-shadow:0 0 45px #7400a955}.timezone-dialog::backdrop{background:#050008d9;backdrop-filter:blur(5px)}.timezone-dialog h2{margin-top:0}.timezone-dialog select{width:100%;padding:.75rem;border-radius:10px;background:#21052d;color:#fff;border:1px solid #7d3ca5;margin:.8rem 0 1.1rem}.timezone-actions{display:flex;gap:.7rem;justify-content:flex-end;flex-wrap:wrap}.timezone-actions button{padding:.65rem 1rem;border-radius:999px;cursor:pointer;border:1px solid #a200ff;background:#a200ff;color:#fff}.timezone-actions .secondary{background:transparent}@media(max-width:720px){.timezone-button span{display:none}}`;
  document.head.append(zoneStyle);
  const dialog=document.createElement("dialog");dialog.className="timezone-dialog";dialog.setAttribute("aria-labelledby","timezone-title");
  const options=[[WolfTimezone.detected,`Detectada · ${WolfTimezone.name(WolfTimezone.detected)}`],...WolfTimezone.zones].filter((item,index,array)=>array.findIndex(other=>other[0]===item[0])===index);
  const region=zone=>zone.startsWith("Europe/")||zone==="Atlantic/Canary"?"Europa":zone.startsWith("America/")?"América":"Asia y Oceanía";
  const groupedOptions=["Europa","América","Asia y Oceanía"].map(group=>`<optgroup label="${group}">${options.filter(([zone])=>region(zone)===group).map(([zone,label])=>`<option value="${zone}"${zone===WolfTimezone.get()?" selected":""}>${label} · ${WolfTimezone.offset(zone)}</option>`).join("")}</optgroup>`).join("");
  dialog.innerHTML=`<h2 id="timezone-title">Tu horario local</h2><p>Hemos detectado <strong>${WolfTimezone.name(WolfTimezone.detected)} (${WolfTimezone.offset(WolfTimezone.detected)})</strong>. Todos los partidos y sesiones se mostrarán en la zona que elijas.</p><label for="wolf-timezone-select">Zona horaria</label><select id="wolf-timezone-select">${groupedOptions}</select><div class="timezone-actions"><button class="secondary" type="button" data-timezone-close>Ahora no</button><button type="button" data-timezone-save>Usar este horario</button></div>`;
  document.body.append(dialog);
  header?.querySelector(".timezone-button")?.addEventListener("click",()=>dialog.showModal());
  dialog.querySelector("[data-timezone-close]")?.addEventListener("click",()=>{localStorage.setItem("wolf-timezone",WolfTimezone.get());dialog.close();});
  dialog.querySelector("[data-timezone-save]")?.addEventListener("click",()=>WolfTimezone.set(dialog.querySelector("select").value));
  if(!WolfTimezone.hasSaved())setTimeout(()=>dialog.showModal(),350);
  document.querySelectorAll(".timezone-note").forEach(note=>note.textContent=`🕒 Horarios en ${WolfTimezone.name(WolfTimezone.get())} (${WolfTimezone.offset(WolfTimezone.get())})`);

  const notificationDefaults={favourite:true,footballLive:false,goals:false,f1:true,motogp:true,changes:true};
  const notificationKey="wolf-notification-preferences",snapshotKey="wolf-notification-snapshot",sentKey="wolf-notifications-sent";
  const loadNotificationSettings=()=>{try{return {...notificationDefaults,...JSON.parse(localStorage.getItem(notificationKey)||"{}")};}catch{return {...notificationDefaults};}};
  const saveNotificationSettings=settings=>localStorage.setItem(notificationKey,JSON.stringify(settings));
  let notificationSettings=loadNotificationSettings();
  const notificationStyle=document.createElement("style");
  notificationStyle.textContent=`.notification-button{position:relative;border:1px solid #8845b8;background:#180522;color:#fff;border-radius:999px;width:42px;height:42px;cursor:pointer;font-size:1.05rem}.notification-dot{position:absolute;right:5px;top:5px;width:8px;height:8px;border-radius:50%;background:#9aa0a6}.notification-button.is-active .notification-dot{background:#20e3b2;box-shadow:0 0 9px #20e3b2}.notification-dialog{border:1px solid #a200ff;border-radius:18px;background:#120018;color:#fff;max-width:560px;width:calc(100% - 2rem);padding:1.4rem;box-shadow:0 0 45px #7400a955}.notification-dialog::backdrop{background:#050008d9;backdrop-filter:blur(5px)}.notification-dialog h2{margin:0 0 .35rem}.notification-dialog>p{color:#cfc4d8}.notification-options{display:grid;gap:.65rem;margin:1rem 0}.notification-option{display:grid;grid-template-columns:auto 1fr;gap:.75rem;align-items:start;padding:.75rem;border:1px solid #553066;border-radius:12px;background:#1b0825}.notification-option input{margin-top:.25rem;accent-color:#b12cff}.notification-option strong,.notification-option small{display:block}.notification-option small{color:#bdb0c7;margin-top:.2rem}.notification-actions{display:flex;gap:.7rem;justify-content:flex-end;flex-wrap:wrap}.notification-actions button{padding:.65rem 1rem;border-radius:999px;cursor:pointer;border:1px solid #a200ff;background:#a200ff;color:#fff}.notification-actions .secondary{background:transparent}.notification-permission{font-size:.88rem;color:#bdb0c7}.wolf-toast-stack{position:fixed;right:1rem;bottom:1rem;z-index:9999;display:grid;gap:.6rem;max-width:min(390px,calc(100vw - 2rem))}.wolf-toast{border:1px solid #a200ff;border-radius:14px;background:#16051fee;color:#fff;padding:.85rem 1rem;box-shadow:0 10px 35px #0009}.wolf-toast strong,.wolf-toast span{display:block}.wolf-toast span{color:#d6cadc;font-size:.9rem;margin-top:.2rem}@media(max-width:720px){.notification-button{width:40px;height:40px}.wolf-toast-stack{left:1rem;right:1rem;max-width:none}}`;
  document.head.append(notificationStyle);
  const notificationDialog=document.createElement("dialog");notificationDialog.className="notification-dialog";notificationDialog.setAttribute("aria-labelledby","notification-title");
  const notificationOptions=[
    ["favourite","Mi equipo","30 minutos antes, comienzo, alineación y resultado final."],
    ["footballLive","Fútbol en directo","Cuando cualquier partido de LaLiga o Champions comience."],
    ["goals","Goles","Cuando cambie el marcador de un encuentro en directo."],
    ["f1","Fórmula 1","30 minutos antes y al comenzar cada sesión."],
    ["motogp","MotoGP","30 minutos antes y al comenzar cada sesión."],
    ["changes","Cambios oficiales","Aplazamientos y cambios relevantes detectados."]
  ];
  notificationDialog.innerHTML=`<h2 id="notification-title">Tus notificaciones</h2><p>Elige únicamente los avisos que quieras recibir. Las preferencias se guardan en este dispositivo.</p><div class="notification-options">${notificationOptions.map(([key,title,description])=>`<label class="notification-option"><input type="checkbox" data-notification-setting="${key}"${notificationSettings[key]?" checked":""}><span><strong>${title}</strong><small>${description}</small></span></label>`).join("")}</div><p class="notification-permission" data-notification-permission></p><div class="notification-actions"><button class="secondary" type="button" data-notification-close>Cerrar</button><button type="button" data-notification-enable>Activar en este dispositivo</button></div>`;
  document.body.append(notificationDialog);
  const notificationButton=header?.querySelector(".notification-button");
  const updateNotificationButton=()=>notificationButton?.classList.toggle("is-active",Object.values(notificationSettings).some(Boolean));
  updateNotificationButton();
  notificationButton?.addEventListener("click",()=>{const status=notificationDialog.querySelector("[data-notification-permission]");status.textContent=!window.Notification?"Este navegador no admite avisos del sistema. Los avisos dentro de WOLFGAMES seguirán funcionando.":Notification.permission==="granted"?"Avisos del dispositivo activados.":Notification.permission==="denied"?"El navegador ha bloqueado los avisos. Puedes reactivarlos desde sus ajustes.":"Puedes activar avisos del navegador cuando WOLFGAMES esté abierto.";notificationDialog.showModal();});
  notificationDialog.querySelectorAll("[data-notification-setting]").forEach(input=>input.addEventListener("change",()=>{notificationSettings[input.dataset.notificationSetting]=input.checked;saveNotificationSettings(notificationSettings);updateNotificationButton();}));
  notificationDialog.querySelector("[data-notification-close]")?.addEventListener("click",()=>notificationDialog.close());
  notificationDialog.querySelector("[data-notification-enable]")?.addEventListener("click",async()=>{const status=notificationDialog.querySelector("[data-notification-permission]");if(!window.Notification){status.textContent="Este navegador no admite avisos del sistema.";return;}const permission=await Notification.requestPermission();status.textContent=permission==="granted"?"Avisos del dispositivo activados.":"No se han activado los avisos del dispositivo.";});
  const toastStack=document.createElement("div");toastStack.className="wolf-toast-stack";toastStack.setAttribute("aria-live","polite");document.body.append(toastStack);
  const emitWolfNotification=(key,title,body,url)=>{let sent={};try{sent=JSON.parse(localStorage.getItem(sentKey)||"{}");}catch{}if(sent[key])return;sent[key]=Date.now();localStorage.setItem(sentKey,JSON.stringify(sent));const toast=document.createElement("div");toast.className="wolf-toast";toast.innerHTML=`<strong>${title}</strong><span>${body}</span>`;if(url)toast.addEventListener("click",()=>location.href=url);toastStack.append(toast);setTimeout(()=>toast.remove(),9000);if(window.Notification&&Notification.permission==="granted")new Notification(title,{body,icon:`${root}favicon.svg`,tag:key});};
  const footballNotificationState=match=>match.state==="finished"||match.status==="Finalizado"?"finished":match.state==="live"?"live":match.state==="postponed"?"postponed":"scheduled";
  const scanNotifications=()=>{notificationSettings=loadNotificationSettings();let previous={};try{previous=JSON.parse(localStorage.getItem(snapshotKey)||"{}");}catch{}const next={};const now=Date.now(),matches=[];
    if(typeof footballData!=="undefined")Object.values(footballData.laligaRounds||{}).flat().forEach(match=>matches.push({...match,competition:"LALIGA"}));
    if(typeof officialChampionsFixtures!=="undefined")officialChampionsFixtures.forEach(match=>matches.push({...match,competition:"Champions"}));
    matches.forEach(match=>{if(!match.iso)return;const key=`${match.competition}|${match.home}|${match.away}|${match.iso}`,state=footballNotificationState(match),score=Number.isInteger(match.homeScore)&&Number.isInteger(match.awayScore)?`${match.homeScore}-${match.awayScore}`:"",favourite=[match.home,match.away].some(team=>window.isFavouriteTeam?.(team)),lineups=Boolean(match.details?.lineups?.home?.starters?.length&&match.details?.lineups?.away?.starters?.length),current={state,score,lineups};next[key]=current;const before=previous[key],delta=new Date(match.iso).getTime()-now;
      if(favourite&&notificationSettings.favourite&&delta>0&&delta<=30*60000)emitWolfNotification(`${key}|soon`,`Tu equipo juega en ${Math.ceil(delta/60000)} min`,`${match.home} – ${match.away}`,"deportes.html");
      if(before&&before.state!==state){if(state==="live"&&((favourite&&notificationSettings.favourite)||notificationSettings.footballLive))emitWolfNotification(`${key}|live`,"Partido en directo",`${match.home} – ${match.away}`,"deportes.html");if(state==="finished"&&favourite&&notificationSettings.favourite)emitWolfNotification(`${key}|final`,"Resultado final",`${match.home} ${score.replace("-", "–")} ${match.away}`,"deportes.html");if(state==="postponed"&&notificationSettings.changes)emitWolfNotification(`${key}|postponed`,"Partido aplazado",`${match.home} – ${match.away}`,"deportes.html");}
      if(before&&before.score&&score&&before.score!==score&&state==="live"&&notificationSettings.goals)emitWolfNotification(`${key}|goal|${score}`,"Cambio en el marcador",`${match.home} ${score.replace("-", "–")} ${match.away}`,"deportes.html");
      if(before&&!before.lineups&&lineups&&favourite&&notificationSettings.favourite)emitWolfNotification(`${key}|lineups`,"Alineaciones disponibles",`${match.home} – ${match.away}`,"deportes.html");
    });
    const motor=[];
    if(notificationSettings.f1&&typeof getF1State==="function"){const state=getF1State();if(state.race&&state.session)motor.push({type:"F1",name:`${state.race.name} · ${state.session[0]}`,time:state.start,live:state.status==="live",url:"F1.html"});}
    if(notificationSettings.motogp&&typeof getNextMotoGP==="function"){const race=getNextMotoGP(),session=typeof getNextMotoSession==="function"?getNextMotoSession(race):null;if(race&&session)motor.push({type:"MotoGP",name:`${race.name} · ${session.name}`,time:new Date(session.start).getTime(),live:typeof motoSessionState==="function"&&motoSessionState(session)==="live",url:"MotoGP.html"});}
    motor.forEach(event=>{const key=`${event.type}|${event.name}|${event.time}`,delta=event.time-now,nextState={state:event.live?"live":"scheduled"};next[key]=nextState;if(delta>0&&delta<=30*60000)emitWolfNotification(`${key}|soon`,`${event.type} en ${Math.ceil(delta/60000)} min`,event.name,event.url);if(previous[key]&&previous[key].state!=="live"&&event.live)emitWolfNotification(`${key}|live`,`${event.type} en directo`,event.name,event.url);});
    localStorage.setItem(snapshotKey,JSON.stringify(next));
  };
  document.addEventListener("DOMContentLoaded",()=>{setTimeout(scanNotifications,1200);setInterval(scanNotifications,60000);});

  const footer = document.querySelector("[data-site-footer]");
  if (footer) footer.innerHTML = `<footer><p>© ${new Date().getFullYear()} WOLFGAMES · Contenido deportivo y gaming</p><p class="footer-note">Horarios mostrados en ${WolfTimezone.name(WolfTimezone.get())} (${WolfTimezone.offset(WolfTimezone.get())}) · Datos sujetos a cambios oficiales</p><p class="footer-status" aria-label="Sistema supervisado automáticamente"><span class="status-indicator" aria-hidden="true">●</span> Supervisión automática activa</p></footer>`;
  document.querySelectorAll('a[target="_blank"]').forEach(link => { link.rel = "noopener noreferrer"; });
  document.addEventListener("click", async event => {
    const button=event.target.closest("[data-share]");if(!button)return;
    const data={title:"WOLFGAMES",text:button.dataset.share,url:location.href};
    if(navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(`${data.text} ${data.url}`); button.textContent="¡Copiado!"; }
  });
})();
