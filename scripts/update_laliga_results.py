#!/usr/bin/env python3
"""Sincroniza marcadores y estados desde la web oficial de LALIGA."""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "sports-data.js"
HTML_FILE = ROOT / "deportes.html"
HOME_FILE = ROOT / "index.html"
RESULTS_URL = "https://www.laliga.com/laliga-easports/resultados/2026-27/jornada-{round}"
MATCH_URL = "https://www.laliga.com/partido/{slug}"
WEBVIEW_URL = "https://apim.laliga.com/webview"
WEBVIEW_KEY = "ee7fcd5c543f4485ba2a48856fc7ece9"
HEADERS = {"User-Agent": "WOLFGAMES-results-sync/1.0 (+https://github.com/Steven2506/CONTENIDO-DEPORTIVO)"}
TIMEOUT = 30

TEAM_ALIASES = {
    "rayo vallecano de madrid": "Rayo Vallecano",
    "rayo vallecano": "Rayo Vallecano",
    "deportivo alaves": "Deportivo Alavés",
    "real betis balompie": "Real Betis",
    "real betis": "Real Betis",
    "real sociedad de futbol": "Real Sociedad",
    "real sociedad": "Real Sociedad",
    "rcd espanyol": "RCD Espanyol de Barcelona",
    "rcd espanyol de barcelona": "RCD Espanyol de Barcelona",
    "real madrid cf": "Real Madrid",
    "rc celta de vigo": "Celta",
    "celta": "Celta",
    "real racing club": "R. Racing Club",
    "r racing club": "R. Racing Club",
    "rc deportivo de la coruna": "RC Deportivo",
    "rc deportivo": "RC Deportivo",
    "club atletico de madrid": "Atlético de Madrid",
    "atletico de madrid": "Atlético de Madrid",
    "club atletico osasuna": "CA Osasuna",
    "ca osasuna": "CA Osasuna",
}

LIVE_STATES = {"Playing", "Live", "FirstHalf", "SecondHalf", "HalfTime", "ExtraTime", "Penalties"}
FINISHED_STATES = {"FullTime", "AfterPenalties", "Finished"}
POSTPONED_STATES = {"Postponed", "Suspended", "Cancelled", "Abandoned"}


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", value.lower()).strip()


def team_name(team: dict) -> str:
    candidates = [team.get("nickname", ""), team.get("boundname", ""), team.get("name", "")]
    for candidate in candidates:
        key = normalize(candidate)
        if key in TEAM_ALIASES:
            return TEAM_ALIASES[key]
    return candidates[0].strip()


def current_round(source: str) -> int:
    match = re.search(r"currentRound:(\d+)", source)
    if not match:
        raise RuntimeError("No se encontró currentRound en sports-data.js")
    return int(match.group(1))


def next_payload(url: str) -> dict:
    response = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
    response.raise_for_status()
    match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', response.text, re.S)
    if not match:
        raise RuntimeError("LALIGA cambió el formato de la página: falta __NEXT_DATA__")
    return json.loads(match.group(1))


def webview_payload(path: str) -> dict:
    response = requests.get(
        f"{WEBVIEW_URL}{path}",
        headers={**HEADERS, "Ocp-Apim-Subscription-Key": WEBVIEW_KEY, "Content-Language": "es"},
        params={"subscription-key": WEBVIEW_KEY, "contentLanguage": "es", "countryCode": "ES"},
        timeout=TIMEOUT,
    )
    if response.status_code in {403, 404, 410}:
        return {}
    response.raise_for_status()
    return response.json()


def official_matches(round_number: int) -> list[dict]:
    payload = next_payload(RESULTS_URL.format(round=round_number))
    matches = payload.get("props", {}).get("pageProps", {}).get("matches")
    if not isinstance(matches, list) or len(matches) != 10:
        raise RuntimeError(f"La jornada oficial no contiene 10 partidos (recibidos: {len(matches or [])})")
    for match in matches:
        if match.get("status") in LIVE_STATES:
            detail = next_payload(MATCH_URL.format(slug=match["slug"])).get("props", {}).get("pageProps", {}).get("match", {})
            for key in ("status", "home_score", "away_score", "period_started", "home_formation", "away_formation", "home_team", "away_team", "opta_id", "id"):
                if key in detail:
                    match[key] = detail[key]
    return matches


def set_property(line: str, key: str, value) -> str:
    rendered = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    if isinstance(value, (dict, list)):
        marker = f",{key}:"
        start = line.find(marker)
        if start >= 0:
            value_start = start + len(marker)
            opener = line[value_start]
            closer = "}" if opener == "{" else "]"
            depth, quoted, escaped = 0, False, False
            for cursor in range(value_start, len(line)):
                char = line[cursor]
                if quoted:
                    if escaped:
                        escaped = False
                    elif char == "\\":
                        escaped = True
                    elif char == '"':
                        quoted = False
                elif char == '"':
                    quoted = True
                elif char == opener:
                    depth += 1
                elif char == closer:
                    depth -= 1
                    if depth == 0:
                        return line[:start] + marker + rendered + line[cursor + 1:]
            raise RuntimeError(f"No se pudo reemplazar {key} en la ficha del partido")
        newline = "\n" if line.endswith("\n") else ""
        body = line.rstrip("\n")
        comma = "," if body.endswith(",") else ""
        if comma:
            body = body[:-1]
        return body[:-1] + f",{key}:{rendered}" + "}" + comma + newline
    pattern = re.compile(rf"{re.escape(key)}:(?:\"[^\"]*\"|-?\d+|null|true|false)")
    if pattern.search(line):
        return pattern.sub(f"{key}:{rendered}", line, count=1)
    newline = "\n" if line.endswith("\n") else ""
    body = line.rstrip("\n")
    comma = "," if body.endswith(",") else ""
    if comma:
        body = body[:-1]
    if not body.endswith("}"):
        raise RuntimeError(f"No se pudo insertar {key} en la ficha del partido")
    return body[:-1] + f",{key}:{rendered}" + "}" + comma + newline


def player_name(lineup: dict) -> str:
    person = lineup.get("person", {})
    return person.get("nickname") or person.get("name") or "Jugador pendiente"


def lineup_team(items: list, formation: str | None) -> dict:
    starters = [item for item in items if item.get("status") == "start"]
    managers = [item for item in items if item.get("position") == 0]
    return {
        "formation": formation or "",
        "manager": player_name(managers[0]) if managers else "",
        "starters": [{"number": item.get("shirt_number"), "name": player_name(item)} for item in starters],
    }


def match_details(match: dict) -> dict:
    match_id, opta_id = match.get("id"), match.get("opta_id")
    if not match_id or not opta_id:
        return {}
    lineups = webview_payload(f"/api/web/matches/{match_id}/lineups")
    events = webview_payload(f"/api/web/matches/{match_id}/events").get("match_events", [])
    team_stats = webview_payload(f"/api/web/matches/opta/{opta_id}/stats").get("match_team_stats", [])
    stats_by_team = {item.get("opta_team_id"): item.get("stats", {}) for item in team_stats}
    home_team, away_team = match.get("home_team", {}), match.get("away_team", {})
    home_id, away_id = home_team.get("id"), away_team.get("id")

    yellow = {home_id: 0, away_id: 0}
    red = {home_id: 0, away_id: 0}
    decisive = []
    for event in events:
        kind = event.get("match_event_kind", {})
        collection, name = kind.get("collection"), kind.get("name", "")
        event_team = event.get("lineup", {}).get("team", {}).get("id")
        if collection == "booking" and "Yellow" in name:
            yellow[event_team] = yellow.get(event_team, 0) + 1
        if collection == "booking" and "Red" in name:
            red[event_team] = red.get(event_team, 0) + 1
        if collection == "goal" or (collection == "booking" and "Red" in name):
            decisive.append({
                "type": "goal" if collection == "goal" else "red",
                "minute": event.get("clock") or event.get("time") or "–",
                "player": player_name(event.get("lineup", {})),
                "team": team_name(home_team) if event_team == home_id else team_name(away_team),
            })

    def selected_stats(team: dict, team_id: int | None) -> dict:
        stats = stats_by_team.get(team.get("opta_id"), {})
        return {
            "possession": stats.get("possession_percentage"),
            "passes": stats.get("total_pass"),
            "shots": stats.get("total_scoring_att"),
            "shotsOnTarget": stats.get("ontarget_scoring_att"),
            "yellowCards": yellow.get(team_id, 0),
            "redCards": red.get(team_id, 0),
        }

    now = datetime.now(ZoneInfo("Europe/Madrid")).strftime("%H:%M")
    return {
        "source": "LALIGA / Opta",
        "updatedAt": now,
        "lineups": {
            "home": lineup_team(lineups.get("home_team_lineups", []), match.get("home_formation")),
            "away": lineup_team(lineups.get("away_team_lineups", []), match.get("away_formation")),
        },
        "stats": {"home": selected_stats(home_team, home_id), "away": selected_stats(away_team, away_id)},
        "events": decisive,
    }


def patch_for(match: dict) -> dict | None:
    status = match.get("status")
    home_score, away_score = match.get("home_score"), match.get("away_score")
    if status in FINISHED_STATES:
        if not isinstance(home_score, int) or not isinstance(away_score, int):
            return None
        return {"status": "Finalizado", "state": "finished", "homeScore": home_score, "awayScore": away_score}
    if status in LIVE_STATES:
        if not isinstance(home_score, int) or not isinstance(away_score, int):
            return None
        patch = {"status": "En directo", "state": "live", "homeScore": home_score, "awayScore": away_score, "period": status}
        period_started = match.get("period_started", {})
        period_start = period_started.get(status, {}).get("start")
        period_bases = {"FirstHalf": 0, "SecondHalf": 45, "ExtraTime": 90, "Penalties": 120}
        if period_start:
            patch["periodStart"] = period_start
            patch["periodBase"] = period_bases.get(status, 0)
        details = match_details(match)
        if details:
            patch["details"] = details
        return patch
    if status in POSTPONED_STATES:
        return {"status": "Aplazado", "state": "postponed"}
    return None


def apply(source: str, round_number: int, matches: list[dict]) -> tuple[str, int]:
    lines = source.splitlines(keepends=True)
    official = {}
    for match in matches:
        home, away = team_name(match["home_team"]), team_name(match["away_team"])
        official[(home, away)] = patch_for(match)

    in_round = False
    seen = set()
    changes = 0
    for index, line in enumerate(lines):
        round_match = re.match(r"\s*(\d+):\[", line)
        if round_match:
            in_round = int(round_match.group(1)) == round_number
        if not in_round:
            continue
        fixture = re.search(r'home:"([^"]+)",away:"([^"]+)"', line)
        if not fixture:
            continue
        key = fixture.groups()
        if key not in official:
            continue
        seen.add(key)
        patch = official[key]
        if not patch:
            continue
        updated = line
        for property_name, value in patch.items():
            updated = set_property(updated, property_name, value)
        if updated != line:
            lines[index] = updated
            changes += 1
            print(f"Actualizado: {key[0]} – {key[1]} · {patch['status']}")

    missing = set(official) - seen
    if missing:
        raise RuntimeError(f"Partidos oficiales sin coincidencia local: {sorted(missing)}")
    return "".join(lines), changes


def update_timestamp(source: str) -> str:
    now = datetime.now(ZoneInfo("Europe/Madrid"))
    months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
    label = f'{now.day} de {months[now.month - 1]} de {now.year} · resultados LALIGA sincronizados'
    return re.sub(r'updated:"[^"]+"', f'updated:"{label}"', source, count=1)


def bust_browser_cache() -> None:
    token = datetime.now(ZoneInfo("Europe/Madrid")).strftime("results-%Y%m%d-%H%M%S")
    for path in (HTML_FILE, HOME_FILE):
        html = path.read_text(encoding="utf-8")
        updated, count = re.subn(r'sports-data\.js(?:\?v=[^"\']+)?', f'sports-data.js?v={token}', html, count=1)
        if count != 1:
            raise RuntimeError(f"No se encontró sports-data.js en {path.name}")
        path.write_text(updated, encoding="utf-8")


def main() -> int:
    source = DATA_FILE.read_text(encoding="utf-8")
    round_number = current_round(source)
    matches = official_matches(round_number)
    updated, changes = apply(source, round_number, matches)
    if changes:
        DATA_FILE.write_text(update_timestamp(updated), encoding="utf-8")
        bust_browser_cache()
    print(f"Jornada {round_number}: 10 partidos verificados · cambios: {changes}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"ERROR SEGURO: {error}. No se publican cambios.", file=sys.stderr)
        raise
