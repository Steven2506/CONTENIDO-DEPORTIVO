document.addEventListener("DOMContentLoaded", () => {
  function setEvent(prefix, event, countdown) {
    const name = document.getElementById(prefix + "-name");
    const place = document.getElementById(prefix + "-circuit");
    const timer = document.getElementById(prefix + "-countdown");
    if (!name || !place || !timer) return;
    if (!event) {
      name.textContent = "Temporada finalizada";
      place.textContent = "Consulta el calendario completo";
      timer.textContent = "🏁";
      return;
    }
    name.textContent = event.name;
    place.textContent = "📍 " + event.circuit;
    countdown(new Date(event.date).getTime(), timer.id);
  }
  setEvent("f1", getNextRace(), startCountdown);
  setEvent("motogp", getNextMotoGP(), startMotoCountdown);
});
