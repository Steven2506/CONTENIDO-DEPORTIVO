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
  const footer = document.querySelector("[data-site-footer]");
  if (footer) footer.innerHTML = `<footer><p>© ${new Date().getFullYear()} WOLFGAMES · Contenido deportivo y gaming</p><p class="footer-note">Horarios mostrados en hora peninsular española · Datos sujetos a cambios oficiales</p></footer>`;
  document.querySelectorAll('a[target="_blank"]').forEach(link => { link.rel = "noopener noreferrer"; });
  document.addEventListener("click", async event => {
    const button=event.target.closest("[data-share]");if(!button)return;
    const data={title:"WOLFGAMES",text:button.dataset.share,url:location.href};
    if(navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(`${data.text} ${data.url}`); button.textContent="¡Copiado!"; }
  });
})();
