#!/usr/bin/env python3
"""Sincroniza marcadores y estados desde la web oficial de LALIGA."""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "sports-data.js"
HTML_FILE = ROOT / "deportes.html"
RESULTS_URL = "https://www.laliga.com/laliga-easports/resultados/2026-27/jornada-{round}"
MATCH_URL = "https://www.laliga.com/partido/{slug}"
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


def official_matches(round_number: int) -> list[dict]:
    payload = next_payload(RESULTS_URL.format(round=round_number))
    matches = payload.get("props", {}).get("pageProps", {}).get("matches")
    if not isinstance(matches, list) or len(matches) != 10:
        raise RuntimeError(f"La jornada oficial no contiene 10 partidos (recibidos: {len(matches or [])})")
    for match in matches:
        if match.get("status") in LIVE_STATES:
            detail = next_payload(MATCH_URL.format(slug=match["slug"])).get("props", {}).get("pageProps", {}).get("match", {})
            for key in ("status", "home_score", "away_score", "period_started"):
                if key in detail:
                    match[key] = detail[key]
    return matches


def set_property(line: str, key: str, value) -> str:
    rendered = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
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
            start = datetime.fromisoformat(period_start.replace("Z", "+00:00"))
            patch["minute"] = max(1, patch["periodBase"] + int((datetime.now(timezone.utc) - start).total_seconds() // 60) + 1)
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
    html = HTML_FILE.read_text(encoding="utf-8")
    token = datetime.now(ZoneInfo("Europe/Madrid")).strftime("results-%Y%m%d-%H%M%S")
    updated, count = re.subn(r'sports-data\.js\?v=[^"\']+', f'sports-data.js?v={token}', html, count=1)
    if count != 1:
        raise RuntimeError("No se encontró la versión de sports-data.js en deportes.html")
    HTML_FILE.write_text(updated, encoding="utf-8")


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
