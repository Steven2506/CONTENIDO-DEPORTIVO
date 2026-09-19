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
RESULTS_URL = "https://www.uefa.com/uefachampionsleague/news/02a8-2174c9e9019d-f909a77bd77a-1000--2026-27-champions-league-all-the-league-phase-fixtures-a/"
HEADERS = {"User-Agent": "WOLFGAMES-champions-sync/1.0 (+https://github.com/Steven2506/CONTENIDO-DEPORTIVO)"}


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

def official_results() -> dict[tuple[str, str], tuple[int, int]]:
    response = requests.get(RESULTS_URL, headers=HEADERS, timeout=30)
    response.raise_for_status()
    visible = html.unescape(re.sub(r"<[^>]+>", " ", response.text))
    visible = re.sub(r"\\[nrt]|\s+", " ", visible)
    fixtures = FIXTURES_FILE.read_text(encoding="utf-8")
    results = {}
    for home_team, away_team in re.findall(r'home:"([^"]+)",away:"([^"]+)"', fixtures):
        official_home = RESULT_ALIASES.get(home_team, home_team)
        official_away = RESULT_ALIASES.get(away_team, away_team)
        match = re.search(rf"{re.escape(official_home)}\s+(\d+)\s*-\s*(\d+)\s+{re.escape(official_away)}", visible, re.I)
        if match:
            results[(home_team, away_team)] = (int(match.group(1)), int(match.group(2)))
    expected_finished = sum(1 for line in fixtures.splitlines() if 'state:"finished"' in line)
    if expected_finished and len(results) < expected_finished:
        raise RuntimeError(f"UEFA publicó resultados incompletos: encontrados {len(results)} de {expected_finished} partidos ya marcados como finalizados")
    return results

def apply_results(source: str, results: dict[tuple[str, str], tuple[int, int]]) -> tuple[str, int]:
    lines, changes = source.splitlines(keepends=True), 0
    for index, line in enumerate(lines):
        fixture = re.search(r'home:"([^"]+)",away:"([^"]+)"', line)
        if not fixture or fixture.groups() not in results:
            continue
        home_score, away_score = results[fixture.groups()]
        updated = re.sub(r'state:"(?:scheduled|live|pending)"', 'state:"finished"', line, count=1)
        for key, value in (("homeScore", home_score), ("awayScore", away_score)):
            if re.search(rf"{key}:\d+", updated):
                updated = re.sub(rf"{key}:\d+", f"{key}:{value}", updated, count=1)
            elif updated.rstrip().endswith("},"):
                newline = "\n" if updated.endswith("\n") else ""
                body = updated.rstrip("\n")
                updated = body[:-2] + f",{key}:{value}" + body[-2:] + newline
            elif updated.rstrip().endswith("}"):
                newline = "\n" if updated.endswith("\n") else ""
                body = updated.rstrip("\n")
                updated = body[:-1] + f",{key}:{value}" + body[-1:] + newline
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
    print(f"UEFA: clasificación={'actualizada' if standings_changed else 'sin cambios'} · resultados encontrados={len(results)} · archivos modificados={fixture_changes}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
