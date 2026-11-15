#!/usr/bin/env python3
"""Validate the curated LunaTerraMars analog dataset.

The dataset is the single source of truth for every score the explorer renders,
so this script enforces the invariants the TypeScript layer can only partially
guarantee at runtime:

* every benchmark site declares a valid body, in-range coordinate and at least
  three NASA citations that resolve to ``citations.ts``;
* every numeric raw parameter is present and lies inside the physically
  plausible normalization bounds from ``parameter_bounds.ts`` (``Infinity`` is
  permitted for quantities that are physically absent, e.g. no accessible ice);
* the site and citation counts match the curated 6 Earth / 4 Moon / 6 Mars
  design, and no identifier is duplicated;
* no placeholder copy leaks into the shipped source tree.

Exit status is 0 on success and 1 on the first failing validation group, so the
script can gate the build. Run from the repository root:

    python scripts/validate_dataset.py
"""

from __future__ import annotations

import math
import re
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
DATASET_PATH = SRC / "data" / "analogs_dataset.ts"
BOUNDS_PATH = SRC / "data" / "parameter_bounds.ts"
CITATIONS_PATH = SRC / "data" / "citations.ts"

EXPECTED_BODY_COUNTS = {"earth": 6, "moon": 4, "mars": 6}
MIN_CITATIONS_PER_SITE = 3
PLACEHOLDER_PATTERN = re.compile(r"\b(TODO|placeholder|lorem|TBD)\b", re.IGNORECASE)

SITE_START = re.compile(r"^export const (\w+): AnalogSite = defineSite\(\{$")
SITE_END = re.compile(r"^\}\)$")
BODY_FIELD = re.compile(r"^\s{2}body: '(earth|moon|mars)',$")
COORDINATE_FIELD = re.compile(
    r"^\s{2}coordinate: \{ lat: (-?\d+(?:\.\d+)?), lon: (-?\d+(?:\.\d+)?) \},$"
)
CITATIONS_FIELD = re.compile(r"^\s{2}citations: cites\((.+)\),$")
RAW_FIELD = re.compile(r"^ {4}(\w+): (.+?),?$")
BOUND_START = re.compile(r"^ {2}(\w+): \{$")
CITATION_ID = re.compile(r"^ {4}id: '([\w-]+)',$")


@dataclass
class RawValue:
    """One parsed ``rawParameters`` entry whose key is numerically bounded."""

    key: str
    value: float
    line: int


@dataclass
class Site:
    """Parsed subset of one ``AnalogSite`` literal."""

    name: str
    body: str
    lat: float
    lon: float
    citations: list[str]
    raw: dict[str, RawValue]


def read_lines(path: Path) -> list[str]:
    """Read a source file as UTF-8 lines, failing loudly if it is missing."""
    if not path.exists():
        raise SystemExit(f"Dataset validation: FAIL — missing {path}")
    return path.read_text(encoding="utf-8").splitlines()


def parse_bounds() -> dict[str, tuple[float, float]]:
    """Return ``{parameter: (min, max)}`` from ``parameter_bounds.ts``."""
    lines = read_lines(BOUNDS_PATH)
    bounds: dict[str, tuple[float, float]] = {}

    index = 0
    while index < len(lines):
        start = BOUND_START.match(lines[index])
        if not start:
            index += 1
            continue

        key = start.group(1)
        minimum: float | None = None
        maximum: float | None = None
        index += 1
        while index < len(lines) and not lines[index].startswith("  },"):
            field = lines[index].strip()
            if field.startswith("min:"):
                minimum = float(field.removeprefix("min:").strip().rstrip(","))
            elif field.startswith("max:"):
                maximum = float(field.removeprefix("max:").strip().rstrip(","))
            index += 1

        if minimum is None or maximum is None:
            raise SystemExit(
                f"Dataset validation: FAIL — bounds for {key} are missing min/max"
            )
        if maximum <= minimum:
            raise SystemExit(
                f"Dataset validation: FAIL — bounds for {key} are not increasing"
            )
        bounds[key] = (minimum, maximum)

    return bounds


def parse_sites(bounds: dict[str, tuple[float, float]]) -> list[Site]:
    """Parse every ``defineSite({...})`` literal into a :class:`Site`."""
    lines = read_lines(DATASET_PATH)
    sites: list[Site] = []

    index = 0
    while index < len(lines):
        start = SITE_START.match(lines[index])
        if not start:
            index += 1
            continue

        name = start.group(1)
        body: str | None = None
        lat: float | None = None
        lon: float | None = None
        citations: list[str] = []
        raw: dict[str, RawValue] = {}

        index += 1
        while index < len(lines) and not SITE_END.match(lines[index]):
            line = lines[index]

            body_match = BODY_FIELD.match(line)
            if body_match:
                body = body_match.group(1)

            coordinate_match = COORDINATE_FIELD.match(line)
            if coordinate_match:
                lat = float(coordinate_match.group(1))
                lon = float(coordinate_match.group(2))

            citations_match = CITATIONS_FIELD.match(line)
            if citations_match:
                citations = re.findall(r"'([\w-]+)'", citations_match.group(1))

            raw_match = RAW_FIELD.match(line)
            if raw_match and raw_match.group(1) in bounds:
                key = raw_match.group(1)
                literal = raw_match.group(2).strip().rstrip(",")
                try:
                    value = math.inf if literal == "Infinity" else float(literal)
                except ValueError:
                    raise SystemExit(
                        f"Dataset validation: FAIL — {name}.{key} is not numeric "
                        f"(found {literal!r})"
                    ) from None
                raw[key] = RawValue(key=key, value=value, line=index + 1)

            index += 1

        if body is None:
            raise SystemExit(
                f"Dataset validation: FAIL — site {name} has no celestial body"
            )
        if lat is None or lon is None:
            raise SystemExit(
                f"Dataset validation: FAIL — site {name} has no coordinate"
            )

        sites.append(
            Site(
                name=name,
                body=body,
                lat=lat,
                lon=lon,
                citations=citations,
                raw=raw,
            )
        )

    return sites


def parse_citation_ids() -> set[str]:
    """Return the set of citation ids declared in ``citations.ts``."""
    lines = read_lines(CITATIONS_PATH)
    return {
        match.group(1)
        for line in lines
        if (match := CITATION_ID.match(line)) is not None
    }


def collect_source_files() -> list[Path]:
    """Every shipped source file that must be free of placeholder copy."""
    return sorted(
        path
        for path in SRC.rglob("*")
        if path.is_file() and path.suffix in {".ts", ".tsx", ".css", ".html"}
    )


def main() -> int:
    problems: list[str] = []
    bounds = parse_bounds()
    sites = parse_sites(bounds)
    citation_ids = parse_citation_ids()

    if not bounds:
        problems.append("parameter_bounds.ts declares no numeric bounds")

    # --- Cardinality -------------------------------------------------------
    counts: dict[str, int] = {}
    for site in sites:
        counts[site.body] = counts.get(site.body, 0) + 1
    if counts != EXPECTED_BODY_COUNTS:
        problems.append(
            f"site counts are {counts}, expected {EXPECTED_BODY_COUNTS}"
        )

    names = [site.name for site in sites]
    duplicates = sorted({name for name in names if names.count(name) > 1})
    if duplicates:
        problems.append(f"duplicate site identifiers: {', '.join(duplicates)}")

    # --- Per-site invariants ----------------------------------------------
    for site in sites:
        if not -90.0 <= site.lat <= 90.0:
            problems.append(f"{site.name}: latitude {site.lat} outside [-90, 90]")
        if not -180.0 <= site.lon <= 180.0:
            problems.append(f"{site.name}: longitude {site.lon} outside [-180, 180]")

        if len(site.citations) < MIN_CITATIONS_PER_SITE:
            problems.append(
                f"{site.name}: {len(site.citations)} citations, minimum is "
                f"{MIN_CITATIONS_PER_SITE}"
            )
        unknown = sorted(set(site.citations) - citation_ids)
        if unknown:
            problems.append(
                f"{site.name}: unknown citation ids {', '.join(unknown)}"
            )

        missing = sorted(set(bounds) - set(site.raw))
        if missing:
            problems.append(f"{site.name}: missing parameters {', '.join(missing)}")

        for key, entry in site.raw.items():
            minimum, maximum = bounds[key]
            if math.isinf(entry.value):
                # Only physically absent quantities may be unbounded.
                if key != "depthToIceM":
                    problems.append(
                        f"{site.name}.{key}: Infinity is not a valid value "
                        f"(line {entry.line})"
                    )
                continue
            if not minimum <= entry.value <= maximum:
                problems.append(
                    f"{site.name}.{key}: {entry.value} outside "
                    f"[{minimum}, {maximum}] (line {entry.line})"
                )

    # --- Placeholder copy --------------------------------------------------
    for path in collect_source_files():
        for number, line in enumerate(read_lines(path), start=1):
            if PLACEHOLDER_PATTERN.search(line):
                relative = path.relative_to(ROOT).as_posix()
                problems.append(
                    f"placeholder copy at {relative}:{number}: {line.strip()}"
                )

    if problems:
        print("Dataset validation: FAIL")
        for problem in problems:
            print(f"  - {problem}")
        return 1

    numeric_values = sum(len(site.raw) for site in sites)
    print(
        "Validated "
        f"{len(sites)} sites "
        f"({counts['earth']} Earth / {counts['moon']} Moon / {counts['mars']} Mars), "
        f"{len(bounds)} bounded parameters, {numeric_values} numeric values and "
        f"{len(citation_ids)} NASA citations."
    )
    print("Dataset validation: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
