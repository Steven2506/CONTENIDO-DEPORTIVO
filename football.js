document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("football-updated").textContent = "Actualizado: " + footballData.updated;
  document.getElementById("laliga-matches").innerHTML = footballData.laliga.map(match => `
    <article class="match-card">
      <div class="match-meta"><span>${match.date}</span><span class="status">${match.status}</span></div>
      <div class="teams"><strong>${match.home}</strong><span>VS</span><strong>${match.away}</strong></div>
      <p>⏰ ${match.time} · 📍 ${match.venue}</p>
    </article>`).join("");
  document.getElementById("champions-dates").innerHTML = footballData.champions.rounds.map(round => `<li>${round}</li>`).join("");
  document.querySelectorAll("[data-tab]").forEach(button => button.addEventListener("click", () => {
    const target = button.dataset.tab;
    document.querySelectorAll("[data-tab]").forEach(item => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-selected", String(item === button));
    });
    document.querySelectorAll("[data-panel]").forEach(panel => { panel.hidden = panel.dataset.panel !== target; });
  }));
});
