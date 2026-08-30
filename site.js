const WolfTimezone=(()=>{
  const storageKey="wolf-timezone";
  const detected=(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||"Europe/Madrid";}catch{return "Europe/Madrid";}})();
  const zones=[
    ["Europe/Madrid","España peninsular"],["Atlantic/Canary","Islas Canarias"],["Europe/London","Reino Unido"],["Europe/Lisbon","Portugal"],
    ["Europe/Paris","Francia"],["Europe/Berlin","Alemania"],["Europe/Rome","Italia"],["America/New_York","EE. UU. · Este"],
    ["America/Chicago","EE. UU. · Centro"],["America/Denver","EE. UU. · Montaña"],["America/Los_Angeles","EE. UU. · Pacífico"],
    ["America/Mexico_City","México"],["America/Bogota","Colombia"],["America/Lima","Perú"],["America/Argentina/Buenos_Aires","Argentina"],
    ["America/Sao_Paulo","Brasil · São Paulo"],["Asia/Tokyo","Japón"],["Asia/Shanghai","China"],["Asia/Kolkata","India"],["Australia/Sydney","Australia · Sídney"]
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
  preferences.src = `${root}preferences.js`;
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
      <button class="timezone-button" type="button" aria-label="Cambiar zona horaria">🌍 <span>${WolfTimezone.name(WolfTimezone.get())}</span></button>
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
  dialog.innerHTML=`<h2 id="timezone-title">Tu horario local</h2><p>Hemos detectado <strong>${WolfTimezone.name(WolfTimezone.detected)} (${WolfTimezone.offset(WolfTimezone.detected)})</strong>. Todos los partidos y sesiones se mostrarán en la zona que elijas.</p><label for="wolf-timezone-select">Zona horaria</label><select id="wolf-timezone-select">${options.map(([zone,label])=>`<option value="${zone}"${zone===WolfTimezone.get()?" selected":""}>${label} · ${WolfTimezone.offset(zone)}</option>`).join("")}</select><div class="timezone-actions"><button class="secondary" type="button" data-timezone-close>Ahora no</button><button type="button" data-timezone-save>Usar este horario</button></div>`;
  document.body.append(dialog);
  header?.querySelector(".timezone-button")?.addEventListener("click",()=>dialog.showModal());
  dialog.querySelector("[data-timezone-close]")?.addEventListener("click",()=>{localStorage.setItem("wolf-timezone",WolfTimezone.get());dialog.close();});
  dialog.querySelector("[data-timezone-save]")?.addEventListener("click",()=>WolfTimezone.set(dialog.querySelector("select").value));
  if(!WolfTimezone.hasSaved())setTimeout(()=>dialog.showModal(),350);
  document.querySelectorAll(".timezone-note").forEach(note=>note.textContent=`🕒 Horarios en ${WolfTimezone.name(WolfTimezone.get())} (${WolfTimezone.offset(WolfTimezone.get())})`);

  const footer = document.querySelector("[data-site-footer]");
  if (footer) footer.innerHTML = `<footer><p>© ${new Date().getFullYear()} WOLFGAMES · Contenido deportivo y gaming</p><p class="footer-note">Horarios mostrados en ${WolfTimezone.name(WolfTimezone.get())} (${WolfTimezone.offset(WolfTimezone.get())}) · Datos sujetos a cambios oficiales</p></footer>`;
  document.querySelectorAll('a[target="_blank"]').forEach(link => { link.rel = "noopener noreferrer"; });
  document.addEventListener("click", async event => {
    const button=event.target.closest("[data-share]");if(!button)return;
    const data={title:"WOLFGAMES",text:button.dataset.share,url:location.href};
    if(navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(`${data.text} ${data.url}`); button.textContent="¡Copiado!"; }
  });
})();
