#!/usr/bin/env python3
"""Actualiza únicamente árbitro y VAR desde publicaciones oficiales de la RFEF."""

from __future__ import annotations

import io
import json
import re
import sys
import unicodedata
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import requests
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "sports-data.js"
RFEF_FILES = "https://rfef.es/sites/default/files/"
HEADERS = {"User-Agent": "WOLFGAMES-referee-sync/1.0 (+https://github.com/Steven2506/CONTENIDO-DEPORTIVO)"}
TIMEOUT = 25

ALIASES = {
    "Deportivo Alavés": ["deportivo alaves", "d alaves"],
    "Getafe CF": ["getafe cf", "getafe"],
    "Sevilla FC": ["sevilla fc", "sevilla"],
    "Rayo Vallecano": ["rayo vallecano", "rayo vallecano de madrid"],
    "R. Racing Club": ["real racing club", "racing club", "racing de santander"],
    "Villarreal CF": ["villarreal cf", "villarreal"],
    "RCD Espanyol de Barcelona": ["rcd espanyol de barcelona", "rcd espanyol", "espanyol"],
    "Levante UD": ["levante ud", "levante"],
    "RC Deportivo": ["rc deportivo", "rc deportivo de la coruna", "deportivo de la coruna"],
    "Elche CF": ["elche cf", "elche"],
    "Atlético de Madrid": ["club atletico de madrid", "atletico de madrid"],
    "Málaga CF": ["malaga cf", "malaga"],
    "Valencia CF": ["valencia cf", "valencia"],
    "Real Betis": ["real betis balompie", "real betis"],
    "Real Madrid": ["real madrid cf", "real madrid"],
    "Real Sociedad": ["real sociedad de futbol", "real sociedad"],
    "Celta": ["rc celta de vigo", "real club celta", "celta de vigo"],
    "CA Osasuna": ["ca osasuna", "club atletico osasuna", "osasuna"],
    "FC Barcelona": ["fc barcelona", "barcelona"],
    "Athletic Club": ["athletic club", "athletic"],
}


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", value.lower()).strip()


def get(url: str) -> requests.Response:
    response = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
    response.raise_for_status()
    return response


def pending_documents(source: str) -> list[tuple[int, str]]:
    """Obtiene jornada y fecha de partidos que todavía no tienen designación."""
    current_round = None
    pending = set()
    for line in source.splitlines():
        round_match = re.match(r"\s*(\d+):\[", line)
        if round_match:
            current_round = int(round_match.group(1))
        if current_round and "referee:null,var:null" in line:
            date_match = re.search(r'date:"([^"]+)"', line)
            if date_match:
                pending.add((current_round, date_match.group(1)))
    return sorted(pending)


def discover_pdfs(source: str) -> list[str]:
    """Prueba el patrón estable de los PDF oficiales sin rastrear la portada bloqueada."""
    candidates = []
    for round_number, date in pending_documents(source):
        date_parts = normalize(date).split()
        if len(date_parts) < 2 or not date_parts[1].isdigit():
            continue
        weekday = date_parts[0]
        stems = [
            f"jornada_{round_number}_{weekday}",
            f"jornada_{round_number}_{weekday}{date_parts[1]}",
        ]
        for stem in stems:
            for suffix in ("", "_2", "_1", "_3"):
                filename = f"designaciones_1a_division_masculina_-_temp_2026-27_-_{stem}{suffix}.pdf"
                candidates.append(f"{RFEF_FILES}{filename}")

    def is_pdf(url: str) -> str | None:
        try:
            return url if get(url).content.startswith(b"%PDF") else None
        except requests.RequestException:
            return None

    with ThreadPoolExecutor(max_workers=8) as executor:
        urls = [url for url in executor.map(is_pdf, sorted(set(candidates))) if url]
    return sorted(set(urls))


def pdf_text(url: str) -> str:
    reader = PdfReader(io.BytesIO(get(url).content))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def extract_name(block: str, labels: list[str]) -> str | None:
    """Extrae el nombre posterior a una etiqueta, tolerando saltos de línea del PDF."""
    for label in labels:
        pattern = rf"(?im){label}\s*:?\s*(?:\n\s*)?([^\n|]{{4,80}})"
        match = re.search(pattern, block)
        if match:
            name = re.split(r"\s{2,}|Árbitro|Asistente|Delegado|Informador", match.group(1))[0].strip(" :-")
            if name and "pendiente" not in normalize(name):
                return name
    return None


def match_block(text: str, home: str, away: str) -> str | None:
    normalized = normalize(text)
    home_hits = [normalized.find(alias) for alias in ALIASES.get(home, [normalize(home)])]
    away_hits = [normalized.find(alias) for alias in ALIASES.get(away, [normalize(away)])]
    home_hits = [hit for hit in home_hits if hit >= 0]
    away_hits = [hit for hit in away_hits if hit >= 0]
    if not home_hits or not away_hits:
        return None
    start, end = min(home_hits), min(away_hits)
    if abs(start - end) > 900:
        return None
    low, high = min(start, end), max(start, end)
    # Los índices normalizados son aproximados, pero un margen amplio conserva la ficha completa.
    return text[max(0, low - 180): min(len(text), high + 1300)]


def fixtures(source: str) -> list[tuple[str, str]]:
    return re.findall(r'home:"([^"]+)",away:"([^"]+)"', source)


def collect_designations(source: str, documents: list[tuple[str, str]]) -> dict[tuple[str, str], dict[str, str]]:
    found = {}
    for home, away in fixtures(source):
        for url, text in documents:
            block = match_block(text, home, away)
            if not block:
                continue
            referee = extract_name(block, [r"Árbitro(?!\s*VAR)(?: principal)?", r"Arbitro(?!\s*VAR)(?: principal)?"])
            var = extract_name(block, [r"Árbitro VAR", r"Arbitro VAR", r"VAR"])
            if referee and var and normalize(referee) != normalize(var):
                found[(home, away)] = {"referee": referee, "var": var, "source": url}
                break
    return found


def apply_updates(source: str, updates: dict[tuple[str, str], dict[str, str]]) -> tuple[str, int]:
    changed = 0
    for (home, away), values in updates.items():
        pattern = re.compile(
            rf'(home:{re.escape(json.dumps(home, ensure_ascii=False))},away:{re.escape(json.dumps(away, ensure_ascii=False))}[^\n]*?)referee:null,var:null'
        )
        replacement = rf'\1referee:{json.dumps(values["referee"], ensure_ascii=False)},var:{json.dumps(values["var"], ensure_ascii=False)}'
        source, count = pattern.subn(replacement, source, count=1)
        changed += count
        if count:
            print(f"Actualizado: {home} – {away}: {values['referee']} / VAR {values['var']}")
    return source, changed


def main() -> int:
    source = DATA_FILE.read_text(encoding="utf-8")
    urls = discover_pdfs(source)
    if not urls:
        print("No hay nuevos PDF oficiales para los partidos pendientes; no se modifican datos.")
        return 0
    documents = []
    for url in urls:
        try:
            documents.append((url, pdf_text(url)))
        except Exception as error:  # Un PDF defectuoso no debe bloquear los demás.
            print(f"Aviso: no se pudo procesar {url}: {error}", file=sys.stderr)
    if not documents:
        raise RuntimeError("No se pudo leer ningún documento oficial; no se modifican datos.")
    updates = collect_designations(source, documents)
    updated, changed = apply_updates(source, updates)
    if changed:
        DATA_FILE.write_text(updated, encoding="utf-8")
    print(f"PDF revisados: {len(documents)} · coincidencias seguras: {len(updates)} · cambios: {changed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
