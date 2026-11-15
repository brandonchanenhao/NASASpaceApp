#!/usr/bin/env python3
"""Build the global 1-degree Earth analog grid from NASA GIBS satellite products.

Every land cell on Earth gets a small vector of *measured* environmental
properties, decoded pixel-by-pixel from NASA GIBS imagery using each layer's
published GIBS colour map (colour -> physical value). The app then scores every
cell against a Moon or Mars target in the browser, which is how the "Hidden
Analogs" heatmap finds candidate sites nobody has curated by hand.

Layers (NASA GIBS, WMS EPSG:4326, four seasonal months of 2024):
  * MODIS Terra L3 monthly land-surface temperature, day and night (K)
  * MODIS Terra L3 monthly NDVI (vegetation)
  * MERRA-2 bias-corrected precipitation (kg m-2 s-1 -> mm/day)
  * MERRA-2 total aerosol optical thickness at 550 nm
  * MERRA-2 surface albedo
  * MODIS Terra L3 monthly snow cover (%)
  * SRTM elevation colour index (m), used for mean elevation and local relief

Output: ``public/data/earth_grid.json`` (land cells only, quantized to integers).

Optional ``--names`` reverse-geocodes the strongest candidates per target with
OpenStreetMap Nominatim (1 request/second, generic user agent) so the app can
label them with a place name instead of bare coordinates.

Run from the project root:  python scripts/build_analog_grid.py [--names]
"""

from __future__ import annotations

import argparse
import io
import json
import math
import re
import sys
import time
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "data" / "earth_grid.json"
CACHE = ROOT / "scripts" / ".gibs_cache"

WMS = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi"
COLORMAPS = "https://gibs.earthdata.nasa.gov/colormaps/v1.3/"
MONTHS = ["2024-01-01", "2024-04-01", "2024-07-01", "2024-10-01"]
UA = "analog-grid-builder/1.0"

# Native fetch resolution (0.5 deg) and output resolution (1 deg).
FETCH_W, FETCH_H = 720, 360
OUT_W, OUT_H = 360, 180

LAYERS = {
    "lstDay": ("MODIS_Terra_L3_Land_Surface_Temp_Monthly_Day", "MODIS_Land_Surface_Temp"),
    "lstNight": ("MODIS_Terra_L3_Land_Surface_Temp_Monthly_Night", "MODIS_Land_Surface_Temp"),
    "ndvi": ("MODIS_Terra_L3_NDVI_Monthly", "MODIS_L3_NDVI"),
    "precip": ("MERRA2_Precipitation_Bias_Corrected_Monthly", "MERRA2_Precipitation_Bias_Corrected_Monthly"),
    "aod": (
        "MERRA2_Total_Aerosol_Optical_Thickness_550nm_Extinction_Monthly",
        "MERRA2_Total_Aerosol_Optical_Thickness_550nm_Extinction_Monthly",
    ),
    "albedo": ("MERRA2_Surface_Albedo_Monthly", "MERRA2_Surface_Albedo_Monthly"),
    "snow": ("MODIS_Terra_L3_Snow_Cover_Monthly_Average_Pct", "MODIS_NDSI_Snow_Cover"),
}
SRTM = ("SRTM_Color_Index", "SRTM_Color_Index")


def fetch(url: str, cache_name: str) -> bytes:
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / cache_name
    if path.exists():
        return path.read_bytes()
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                data = response.read()
            path.write_bytes(data)
            return data
        except Exception as error:  # noqa: BLE001 - retry any transport error
            print(f"  retry {attempt + 1}: {error}", file=sys.stderr)
            time.sleep(2)
    raise RuntimeError(f"failed to fetch {url}")


def parse_interval(text: str) -> float | None:
    """GIBS value strings look like "[a,b)", "[a]" or "[-INF,a)"."""
    nums = []
    for part in text.strip("[]()").split(","):
        part = part.strip()
        if "INF" in part:
            nums.append(None)
        else:
            nums.append(float(part))
    finite = [n for n in nums if n is not None]
    if not finite:
        return None
    return sum(finite) / len(finite)


def load_colormap(name: str) -> tuple[np.ndarray, np.ndarray]:
    xml = fetch(COLORMAPS + name + ".xml", f"cm_{name}.xml").decode("utf-8")
    rgbs, values = [], []
    for entry in re.finditer(r"<ColorMapEntry ([^>]*)/>", xml):
        attrs = dict(re.findall(r'(\w+)="([^"]*)"', entry.group(1)))
        if attrs.get("nodata") == "true":
            continue
        raw = attrs.get("value") or attrs.get("sourceValue")
        if raw is None:
            continue
        value = parse_interval(raw)
        if value is None:
            continue
        rgbs.append([int(c) for c in attrs["rgb"].split(",")])
        values.append(value)
    return np.array(rgbs, dtype=np.int32), np.array(values, dtype=np.float64)


def decode(png: bytes, colormap: tuple[np.ndarray, np.ndarray], transparent_value: float | None) -> np.ndarray:
    """Map every pixel colour back to its physical value (nearest palette colour)."""
    image = Image.open(io.BytesIO(png)).convert("RGBA")
    pixels = np.asarray(image).astype(np.int32)
    rgb, alpha = pixels[..., :3], pixels[..., 3]
    palette, values = colormap
    flat = rgb.reshape(-1, 3)
    unique, inverse = np.unique(flat, axis=0, return_inverse=True)
    dist = ((unique[:, None, :] - palette[None, :, :]) ** 2).sum(axis=2)
    nearest = dist.argmin(axis=1)
    decoded = values[nearest][inverse.reshape(-1)].reshape(rgb.shape[:2])
    # Reject colours that are not actually in the palette (anti-aliasing, labels).
    bad = dist.min(axis=1)[inverse.reshape(-1)].reshape(rgb.shape[:2]) > 30
    out = np.where((alpha > 0) & ~bad, decoded, np.nan)
    if transparent_value is not None:
        out = np.where(alpha == 0, transparent_value, out)
    return out


def wms_url(layer: str, width: int, height: int, time_value: str | None) -> str:
    url = (
        f"{WMS}?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS={layer}&STYLES="
        f"&CRS=EPSG:4326&BBOX=-90,-180,90,180&WIDTH={width}&HEIGHT={height}"
        f"&FORMAT=image/png&TRANSPARENT=TRUE"
    )
    if time_value:
        url += f"&TIME={time_value}"
    return url


def block(arr: np.ndarray, fn) -> np.ndarray:
    """Aggregate a (H, W) array into 1-degree blocks, ignoring NaN."""
    fy, fx = arr.shape[0] // OUT_H, arr.shape[1] // OUT_W
    view = arr.reshape(OUT_H, fy, OUT_W, fx).transpose(0, 2, 1, 3).reshape(OUT_H, OUT_W, fy * fx)
    with np.errstate(all="ignore"):
        import warnings

        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=RuntimeWarning)
            return fn(view, axis=2)


def monthly_stack(key: str, transparent_value: float | None = None) -> np.ndarray:
    layer, cm_name = LAYERS[key]
    colormap = load_colormap(cm_name)
    frames = []
    for month in MONTHS:
        print(f"  {key} {month}")
        png = fetch(wms_url(layer, FETCH_W, FETCH_H, month), f"{layer}_{month}.png")
        frames.append(decode(png, colormap, transparent_value))
    return np.stack(frames)


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser()
    parser.add_argument("--names", action="store_true", help="reverse-geocode top candidates")
    args = parser.parse_args()

    print("Fetching NASA GIBS layers…")
    lst_day = monthly_stack("lstDay")
    lst_night = monthly_stack("lstNight")
    ndvi = monthly_stack("ndvi", transparent_value=None)
    precip = monthly_stack("precip") * 86400.0  # kg m-2 s-1 == mm/s -> mm/day
    aod = monthly_stack("aod")
    albedo = monthly_stack("albedo")
    snow = monthly_stack("snow", transparent_value=0.0)

    import warnings

    warnings.simplefilter("ignore", category=RuntimeWarning)
    land_fine = np.isfinite(np.nanmean(lst_day, axis=0)) | np.isfinite(np.nanmean(ndvi, axis=0))

    day = block(np.nanmean(lst_day, axis=0), np.nanmean)
    night_mean = block(np.nanmean(lst_night, axis=0), np.nanmean)
    night_min = block(np.nanmin(lst_night, axis=0), np.nanmean)
    day_max = block(np.nanmax(lst_day, axis=0), np.nanmean)
    veg = block(np.nanmean(ndvi, axis=0), np.nanmean)
    rain = block(np.nanmean(precip, axis=0), np.nanmean)
    dust = block(np.nanmean(aod, axis=0), np.nanmean)
    alb = block(np.nanmean(albedo, axis=0), np.nanmean)
    ice = block(np.where(land_fine, np.nanmean(snow, axis=0), np.nan), np.nanmean)
    land = block(land_fine.astype(float), np.mean) >= 0.3

    print("  SRTM elevation (0.1 deg)")
    srtm_png = fetch(wms_url(SRTM[0], 3600, 1800, None), "srtm_3600.png")
    elev_fine = decode(srtm_png, load_colormap(SRTM[1]), None)
    elev = block(elev_fine, np.nanmean)
    relief = block(elev_fine, np.nanstd)

    cells = []
    for row in range(OUT_H):
        lat = 90 - row - 0.5
        for col in range(OUT_W):
            lon = -180 + col + 0.5
            if not land[row, col] or not math.isfinite(day[row, col]):
                continue

            def q(value: float, scale: float = 1.0) -> int | None:
                return None if not math.isfinite(value) else int(round(value * scale))

            cells.append(
                [
                    row * OUT_W + col,
                    q(day_max[row, col]),  # warmest-month daytime LST, K
                    q(night_min[row, col]),  # coldest-month night LST, K
                    q(day[row, col] - night_mean[row, col]),  # mean day-night swing, K
                    q(veg[row, col], 100),  # NDVI x100
                    q(rain[row, col], 100),  # precip mm/day x100
                    q(dust[row, col], 100),  # AOD x100
                    q(alb[row, col], 100),  # albedo x100
                    q(ice[row, col]),  # snow cover %
                    q(elev[row, col]),  # mean elevation m
                    q(relief[row, col]),  # elevation std within cell, m
                ]
            )

    payload = {
        "source": "NASA GIBS (MODIS Terra L3, MERRA-2, SRTM), months " + ", ".join(m[:7] for m in MONTHS),
        "resolutionDeg": 1,
        "fields": [
            "cell",
            "peakTempK",
            "minTempK",
            "diurnalSwingK",
            "ndvi100",
            "precipMmDay100",
            "aod100",
            "albedo100",
            "snowPct",
            "elevationM",
            "reliefM",
        ],
        "cells": cells,
        "names": {},
    }
    if OUT.exists():
        try:
            payload["names"] = json.loads(OUT.read_text(encoding="utf-8")).get("names", {})
        except json.JSONDecodeError:
            pass

    if args.names:
        geocode_candidates(payload)

    OUT.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {len(cells)} land cells -> {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")


def geocode_candidates(payload: dict) -> None:
    """Label the cells listed in scripts/.candidates.json (written by the app test)."""
    candidates_path = ROOT / "scripts" / ".candidates.json"
    if not candidates_path.exists():
        print("No scripts/.candidates.json; run `npm run candidates` first.")
        return
    names = payload["names"]
    for cell in json.loads(candidates_path.read_text(encoding="utf-8")):
        key = str(cell)
        if key in names:
            continue
        row, col = divmod(cell, OUT_W)
        lat, lon = 90 - row - 0.5, -180 + col + 0.5
        # Region-level first; remote deserts often only resolve at country level.
        label = ""
        for zoom in (6, 3):
            label = reverse_geocode(lat, lon, zoom, cell)
            time.sleep(1.1)
            if label:
                break
        if label:
            names[key] = label
            print(f"  {cell}: {label}")


def reverse_geocode(lat: float, lon: float, zoom: int, cell: int) -> str:
    url = (
        f"https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom={zoom}"
        f"&accept-language=en&lat={lat}&lon={lon}"
    )
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.loads(response.read())
    except Exception as error:  # noqa: BLE001
        print(f"  geocode failed for {cell}: {error}", file=sys.stderr)
        return ""
    address = data.get("address", {})
    parts = [
        address.get("state") or address.get("region") or address.get("county"),
        address.get("country"),
    ]
    return ", ".join(p for p in parts if p)


if __name__ == "__main__":
    main()
