"""Sync upcoming MotoGP session times from MotoGP's public results API."""

from __future__ import annotations

import json
import re
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import requests


ROOT = Path(__file__).resolve().parents[1]
API = "https://api.motogp.pulselive.com/motogp/v1"
SEASON = 2026
CATEGORY_UUID = "e8c110ad-64aa-4e8e-8a86-f2f152f6a942"
DATA_FILE = ROOT / "motogp-schedule-data.js"
CALENDAR_FILE = ROOT / "motogpcalendar.js"
PAGES = (ROOT / "index.html", ROOT / "MotoGP.html", ROOT / "motogp-gp.html")
HEADERS = {
    "Accept": "application/json",
    "User-Agent": "WOLFGAMES-MotoGP-schedule-sync/1.0 (+https://github.com/Steven2506/CONTENIDO-DEPORTIVO)",
}
TIMEOUT = 25

SESSION_TYPES = {
    ("FP", 1): ("FP1", 45),
    ("FP", 2): ("FP2", 30),
    ("PR", None): ("Practice", 60),
    ("Q", 1): ("Clasificación Q1", 15),
    ("Q", 2): ("Clasificación Q2", 15),
    ("SPR", None): ("Sprint", 45),
    ("WUP", None): ("Warm Up", 10),
    ("RAC", None): ("Carrera", 90),
}


def api_json(path: str, params: dict | None = None):
    response = requests.get(f"{API}/{path}", params=params, headers=HEADERS, timeout=TIMEOUT)
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, list):
        raise RuntimeError(f"MotoGP devolvió una respuesta inesperada en /{path}")
    return payload


def calendar_races() -> list[dict]:
    source = CALENDAR_FILE.read_text(encoding="utf-8")
    block = source.split("].map(([name,circuit,date,label],i)=>", 1)[0]
    rows = re.findall(r'^\s*\["([^"]+)","([^"]+)","([^"]+)","([^"]+)"\],?\s*$', block, re.MULTILINE)
    if len(rows) != 22:
        raise RuntimeError(f"El calendario local no contiene 22 rondas reconocibles (recibidas: {len(rows)})")
    return [
        {"round": index, "name": name, "circuit": circuit, "date": start}
        for index, (name, circuit, start, _label) in enumerate(rows, start=1)
    ]


def event_sessions(event_id: str) -> list[dict]:
    sessions = api_json(
        "results/sessions",
        {"eventUuid": event_id, "categoryUuid": CATEGORY_UUID},
    )
    mapped = []
    for session in sessions:
        kind = str(session.get("type", "")).upper()
        number = session.get("number")
        key = (kind, number if kind in {"FP", "Q"} else None)
        details = SESSION_TYPES.get(key)
        if not details:
            continue
        started = session.get("date")
        if not isinstance(started, str):
            continue
        instant = datetime.fromisoformat(started.replace("Z", "+00:00"))
        if instant.tzinfo is None:
            raise RuntimeError("MotoGP devolvió una sesión sin zona horaria")
        name, duration = details
        mapped.append({"name": name, "start": instant.isoformat(timespec="seconds"), "duration": duration})
    mapped.sort(key=lambda item: item["start"])
    if len({item["name"] for item in mapped}) != len(mapped):
        raise RuntimeError("MotoGP devolvió sesiones duplicadas para una ronda")
    return mapped


def existing_schedule() -> dict:
    source = DATA_FILE.read_text(encoding="utf-8")
    match = re.search(r"window\.MOTOGP_OFFICIAL_SESSIONS\s*=\s*(\{.*?\});", source, re.DOTALL)
    if not match:
        raise RuntimeError("No se encontró el objeto de horarios oficiales local")
    schedule = json.loads(match.group(1))
    if not isinstance(schedule, dict):
        raise RuntimeError("El archivo de horarios oficiales tiene un formato no válido")
    return schedule


def write_schedule(schedule: dict) -> None:
    rendered = json.dumps(schedule, ensure_ascii=False, separators=(",", ":"))
    DATA_FILE.write_text(
        "// Horarios sincronizados desde el API oficial de MotoGP. No editar a mano.\n"
        f"window.MOTOGP_OFFICIAL_SESSIONS = {rendered};\n",
        encoding="utf-8",
    )


def bust_browser_cache() -> None:
    token = datetime.now(ZoneInfo("Europe/Madrid")).strftime("motogp-%Y%m%d-%H%M%S")
    for path in PAGES:
        source = path.read_text(encoding="utf-8")
        updated, count = re.subn(
            r'motogp-schedule-data\.js(?:\?v=[^"\']+)?',
            f"motogp-schedule-data.js?v={token}",
            source,
            count=1,
        )
        if count != 1:
            raise RuntimeError(f"No se encontró motogp-schedule-data.js en {path.name}")
        path.write_text(updated, encoding="utf-8")


def main() -> int:
    today = datetime.now(timezone.utc).date()
    seasons = api_json("results/seasons")
    season = next((item for item in seasons if item.get("year") == SEASON), None)
    if not season or not season.get("id"):
        raise RuntimeError(f"MotoGP no devolvió el identificador de la temporada {SEASON}")

    races = calendar_races()
    races_by_date = {race["date"][:10]: race for race in races}
    events = api_json("results/events", {"seasonUuid": season["id"]})
    start_limit, end_limit = today - timedelta(days=7), today + timedelta(days=45)
    candidates = []
    for event in events:
        start, end = event.get("date_start"), event.get("date_end")
        if not start or not end:
            continue
        start_day, end_day = date.fromisoformat(start), date.fromisoformat(end)
        if end_day < start_limit or start_day > end_limit:
            continue
        race = races_by_date.get(start)
        if not race:
            raise RuntimeError(f"La ronda oficial del {start} no coincide con el calendario local")
        candidates.append((race, event))
    if not candidates:
        raise RuntimeError("La API de MotoGP no devolvió rondas próximas para sincronizar")

    schedule = existing_schedule()
    changed_events = 0
    for race, event in candidates:
        sessions = event_sessions(event["id"])
        if not sessions:
            print(f"Programa aún no disponible: {race['name']}")
            continue
        key = str(race["round"])
        if schedule.get(key) != sessions:
            schedule[key] = sessions
            changed_events += 1
            print(f"Sincronizado: {race['name']} · {len(sessions)} sesiones")
    if changed_events:
        write_schedule(schedule)
        bust_browser_cache()
    print(f"Rondas revisadas: {len(candidates)} · rondas modificadas: {changed_events}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"ERROR SEGURO: {error}. No se publica ningún cambio.", file=sys.stderr)
        raise SystemExit(1)
