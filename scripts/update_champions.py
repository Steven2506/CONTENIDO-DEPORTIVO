#!/usr/bin/env python3
"""Sincroniza de forma segura la clasificación oficial de Champions 2026/27."""

from __future__ import annotations

import html
import json
import re
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "champions-data.js"
FIXTURES_FILE = ROOT / "champions-fixtures.js"
HTML_FILE = ROOT / "deportes.html"
STANDINGS_URL = "https://standings.uefa.com/v1/standings?competitionId=1&seasonYear=2027"
MATCHES_URL = "https://match.uefa.com/v5/matches?competitionId=1&seasonYear=2027&phase=TOURNAMENT&order=ASC&offset=0&limit=500"
HEADERS = {"User-Agent": "WOLFGAMES-champions-sync/1.0 (+https://github.com/Steven2506/CONTENIDO-DEPORTIVO)"}
EVENTS_LIMIT = 100


def official_rows() -> list[dict]:
    response = requests.get(STANDINGS_URL, headers=HEADERS, timeout=30)
    response.raise_for_status()
    groups = response.json()
    if not groups:
        return []
    items = groups[0].get("items", [])
    if len(items) != 36:
        raise RuntimeError(f"UEFA no devolvió 36 equipos (recibidos: {len(items)})")
    rows = []
    for item in items:
        team = item.get("team", {})
        raw_name = team.get("translations", {}).get("displayName", {}).get("ES") or team.get("internationalName")
        name = DISPLAY_ALIASES.get(raw_name, raw_name)
        row = {
            "pos": item.get("rank"), "team": name, "played": item.get("played"),
            "won": item.get("won"), "drawn": item.get("drawn"), "lost": item.get("lost"),
            "gf": item.get("goalsFor"), "ga": item.get("goalsAgainst"),
            "gd": item.get("goalDifference"), "points": item.get("points"), "pending": False,
        }
        if not name or any(not isinstance(row[key], int) for key in ("pos", "played", "won", "drawn", "lost", "gf", "ga", "gd", "points")):
            raise RuntimeError("UEFA devolvió una fila incompleta; no se publica ningún cambio")
        rows.append(row)
    if len({row["team"] for row in rows}) != 36:
        raise RuntimeError("UEFA devolvió equipos duplicados; no se publica ningún cambio")
    return rows


def apply(source: str, rows: list[dict]) -> tuple[str, bool]:
    if not rows:
        return source, False
    rendered = json.dumps(rows, ensure_ascii=False, separators=(",", ":"))
    start, end = source.find("  standings:"), source.find("\n  rounds:")
    if start < 0 or end < 0 or end <= start:
        raise RuntimeError("No se encontró el bloque standings en champions-data.js")
    replacement = f"  standings:{rendered},"
    updated = source[:start] + replacement + source[end:]
    if updated == source:
        return source, False
    now = datetime.now(ZoneInfo("Europe/Madrid"))
    label = now.strftime("%d/%m/%Y %H:%M")
    updated = re.sub(r'updated:"[^"]+"', f'updated:"{label} · clasificación UEFA sincronizada"', updated, count=1)
    if 'phase:"pre-draw"' in updated:
        updated = updated.replace('phase:"pre-draw"', 'phase:"league"', 1)
    return updated, True


RESULT_ALIASES = {
    "B. Dortmund": "Borussia Dortmund", "Man City": "Manchester City",
    "Atleti": "Atlético de Madrid", "Paris": "Paris Saint-Germain",
    "S. Bratislava": "Slovan Bratislava", "PSV": "PSV Eindhoven",
    "Shakhtar": "Shakhtar Donetsk", "Man Utd": "Manchester United",
}
DISPLAY_ALIASES = {value:key for key,value in RESULT_ALIASES.items()}
DISPLAY_ALIASES.update({"Paris Saint-Germain":"Paris","Barcelona":"Barcelona"})
FIXTURE_PATTERN = r"""["']?home["']?\s*:\s*"([^"]+)"\s*,\s*["']?away["']?\s*:\s*"([^"]+)""" 

def normalize_uefa_text(value: str) -> str:
    value = html.unescape(value).replace("\u200b", " ").replace("\ufeff", " ")
    value = re.sub(r"\s+", " ", value).strip()
    return re.sub(r"\s*[-–—]\s*", "-", value)

def normalize_event(match: dict, event: dict, local_by_official: dict) -> dict | None:
    event_type = str(event.get("type") or "").upper()
    type_map = {
        "GOAL": "goal",
        "YELLOW_CARD": "yellow",
        "RED_CARD": "red",
        "SUBSTITUTION": "substitution",
        "PENALTY": "goal",
    }
    visible_type = type_map.get(event_type)
    if not visible_type:
        return None
    actor = event.get("primaryActor") or {}
    person = actor.get("person") or {}
    team = actor.get("team") or {}
    raw_team = team.get("internationalName") or team.get("displayName") or ""
    local_team = local_by_official.get(normalize_uefa_text(raw_team), raw_team)
    name = person.get("internationalName") or person.get("displayName") or ""
    time = event.get("time") or {}
    minute = time.get("minute")
    injury = time.get("injuryMinute")
    if not isinstance(minute, int):
        return None
    minute_label = str(minute)
    if isinstance(injury, int) and injury > 0:
        minute_label = f"{minute}+{injury}"
    return {"type": visible_type, "minute": minute_label, "player": name or "Jugador pendiente", "team": local_team}

def official_events(match_id: str | int, local_by_official: dict) -> list[dict]:
    url = f"https://match.uefa.com/v5/matches/{match_id}/events"
    try:
        response = requests.get(
            url,
            params={"filter": "LINEUP", "order": "ASC", "limit": str(EVENTS_LIMIT), "offset": "0"},
            headers=HEADERS,
            timeout=30,
        )
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, list):
            return []
        events = []
        for event in payload:
            normalized = normalize_event({}, event, local_by_official)
            if normalized:
                events.append(normalized)
        return events
    except (requests.RequestException, ValueError):
        return []

def official_results() -> dict[tuple[str, str], dict]:
    fixtures = FIXTURES_FILE.read_text(encoding="utf-8")
    fixture_rows = re.findall(FIXTURE_PATTERN, fixtures)
    if len(fixture_rows) != 144 or len(set(fixture_rows)) != 144:
        raise RuntimeError(f"El calendario local de Champions no contiene exactamente 144 partidos únicos (recibidos: {len(fixture_rows)})")
    response = requests.get(MATCHES_URL, headers=HEADERS, timeout=30)
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, list):
        raise RuntimeError("UEFA devolvió un payload de partidos no válido; no se publica ningún cambio")
    local_by_official = {normalize_uefa_text(value): key for key, value in RESULT_ALIASES.items()}
    for home, away in fixture_rows:
        local_by_official.setdefault(normalize_uefa_text(home), home)
        local_by_official.setdefault(normalize_uefa_text(away), away)
    results = {}
    for match in payload:
        home_raw = ((match.get("homeTeam") or {}).get("internationalName") or (match.get("homeTeam") or {}).get("displayName"))
        away_raw = ((match.get("awayTeam") or {}).get("internationalName") or (match.get("awayTeam") or {}).get("displayName"))
        score = match.get("score") or {}
        score_data = score.get("regular") or score.get("total") or {}
        home_score = score_data.get("home") if isinstance(score_data, dict) else None
        away_score = score_data.get("away") if isinstance(score_data, dict) else None
        if not isinstance(home_score, int) or not isinstance(away_score, int) or not home_raw or not away_raw:
            continue
        local_home = local_by_official.get(normalize_uefa_text(home_raw))
        local_away = local_by_official.get(normalize_uefa_text(away_raw))
        if local_home and local_away:
            results[(local_home, local_away)] = {
                "homeScore": home_score,
                "awayScore": away_score,
                "events": official_events(match.get("id"), local_by_official) if match.get("id") else [],
            }
    expected_finished = len(re.findall(r"""["']?state["']?\\s*:\\s*["']finished["']""", fixtures))
    if expected_finished and len(results) < expected_finished:
        finished_rows = []
        for line in fixtures.splitlines():
            fixture = re.search(FIXTURE_PATTERN, line)
            if fixture and re.search(r"""["']?state["']?\\s*:\\s*["']finished["']""", line):
                finished_rows.append(fixture.groups())
        missing = [pair for pair in finished_rows if pair not in results]
        raise RuntimeError(f"UEFA publicó resultados incompletos: encontrados {len(results)} de {expected_finished} partidos ya marcados como finalizados; faltan: {missing}")
    return results

def apply_results(source: str, results: dict[tuple[str, str], dict]) -> tuple[str, int]:
    lines, changes = source.splitlines(keepends=True), 0
    for index, line in enumerate(lines):
        fixture = re.search(FIXTURE_PATTERN, line)
        if not fixture or fixture.groups() not in results:
            continue
        patch = results[fixture.groups()]
        updated = re.sub(r'state:"(?:scheduled|live|pending)"', 'state:"finished"', line, count=1)
        for key in ("homeScore", "awayScore"):
            value = patch[key]
            if re.search(rf"{key}:\\d+", updated):
                updated = re.sub(rf"{key}:\\d+", f"{key}:{value}", updated, count=1)
            elif updated.rstrip().endswith("},"):
                newline = "\n" if updated.endswith("\n") else ""
                body = updated.rstrip("\n")
                updated = body[:-2] + f",{key}:{value}" + body[-2:] + newline
            elif updated.rstrip().endswith("}"):
                newline = "\n" if updated.endswith("\n") else ""
                body = updated.rstrip("\n")
                updated = body[:-1] + f",{key}:{value}" + body[-1:] + newline
        events = patch.get("events") or []
        if events:
            details = {"source": "UEFA", "events": events}
            serialized = json.dumps(details, ensure_ascii=False, separators=(",", ":"))
            if re.search(r'details:\\{.*?\\}', updated):
                updated = re.sub(r'details:\\{.*?\\}', f"details:{serialized}", updated, count=1)
            elif updated.rstrip().endswith("},"):
                newline = "\n" if updated.endswith("\n") else ""
                body = updated.rstrip("\n")
                updated = body[:-2] + f",details:{serialized}" + body[-2:] + newline
            elif updated.rstrip().endswith("}"):
                newline = "\n" if updated.endswith("\n") else ""
                body = updated.rstrip("\n")
                updated = body[:-1] + f",details:{serialized}" + body[-1:] + newline
        if updated != line:
            lines[index], changes = updated, changes + 1
    return "".join(lines), changes

def bust_cache(data_changed: bool, results_changed: bool) -> None:
    html_source = HTML_FILE.read_text(encoding="utf-8")
    token = datetime.now(ZoneInfo("Europe/Madrid")).strftime("champions-%Y%m%d-%H%M%S")
    if data_changed:
        html_source, count = re.subn(r'champions-data\.js(?:\?v=[^"\']+)?', f'champions-data.js?v={token}', html_source, count=1)
        if count != 1:
            raise RuntimeError("No se encontró champions-data.js en deportes.html")
    if results_changed:
        html_source, count = re.subn(r'champions-fixtures\.js(?:\?v=[^"\']+)?', f'champions-fixtures.js?v={token}', html_source, count=1)
        if count != 1:
            raise RuntimeError("No se encontró champions-fixtures.js en deportes.html")
    HTML_FILE.write_text(html_source, encoding="utf-8")

def main() -> int:
    source = DATA_FILE.read_text(encoding="utf-8")
    updated, standings_changed = apply(source, official_rows())
    results = official_results()
    fixtures_source = FIXTURES_FILE.read_text(encoding="utf-8")
    updated_fixtures, fixture_changes = apply_results(fixtures_source, results)
    results_changed = bool(fixture_changes)
    if standings_changed:
        DATA_FILE.write_text(updated, encoding="utf-8")
    if fixture_changes:
        FIXTURES_FILE.write_text(updated_fixtures, encoding="utf-8")
    if standings_changed or results_changed:
        bust_cache(standings_changed, results_changed)
    print(f"UEFA: clasificación={'actualizada' if standings_changed else 'sin cambios'} · resultados encontrados={len(results)} · archivos modificados={fixture_changes} · incidencias sincronizadas={sum(bool(item.get('events')) for item in results.values())}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
