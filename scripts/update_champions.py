#!/usr/bin/env python3
"""Sincroniza de forma segura la clasificación oficial de Champions 2026/27."""

from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "champions-data.js"
HTML_FILE = ROOT / "deportes.html"
STANDINGS_URL = "https://standings.uefa.com/v1/standings?competitionId=1&seasonYear=2027"
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
        name = team.get("translations", {}).get("displayName", {}).get("ES") or team.get("internationalName")
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


def bust_cache() -> None:
    html = HTML_FILE.read_text(encoding="utf-8")
    token = datetime.now(ZoneInfo("Europe/Madrid")).strftime("champions-%Y%m%d-%H%M%S")
    updated, count = re.subn(r'champions-data\.js(?:\?v=[^"\']+)?', f'champions-data.js?v={token}', html, count=1)
    if count != 1:
        raise RuntimeError("No se encontró champions-data.js en deportes.html")
    HTML_FILE.write_text(updated, encoding="utf-8")


def main() -> int:
    source = DATA_FILE.read_text(encoding="utf-8")
    updated, changed = apply(source, official_rows())
    if changed:
        DATA_FILE.write_text(updated, encoding="utf-8")
        bust_cache()
        print("Clasificación Champions actualizada desde UEFA")
    else:
        print("UEFA todavía no ha publicado cambios en la clasificación")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
