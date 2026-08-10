"""Dev-only codegen: shrink the demo JPEGs into model-sized WebP derivatives.

    uv run python tools/build_derivatives.py

The source photos are 1.7-6.9 MB each. Gemini tiles images at 768px, so sending
the originals is pure latency for zero accuracy. Output (~60 KB each) is
committed so the Docker build context stays inside `backend/` and Pillow never
enters the runtime image.

SVGs are copied verbatim: they are ~1 KB of XML that the chart/text agents read
as *text*, which is faster and more accurate than rasterising them.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

BACKEND = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND.parent
PUBLIC = REPO_ROOT / "frontend" / "public"
CATALOG = json.loads((BACKEND / "app" / "catalog" / "catalog.json").read_text("utf-8"))

DERIVATIVES = BACKEND / "app" / "media" / "derivatives"
SVG_DIR = BACKEND / "app" / "media" / "svg"

MAX_EDGE = 768
WEBP_QUALITY = 80


def main() -> int:
    DERIVATIVES.mkdir(parents=True, exist_ok=True)
    SVG_DIR.mkdir(parents=True, exist_ok=True)

    total_src = total_out = 0
    missing: list[str] = []

    for asset_id, meta in CATALOG["media"].items():
        src = PUBLIC / meta["publicPath"].lstrip("/")
        if not src.exists():
            missing.append(f"{asset_id}: {src}")
            continue

        if meta["isSvg"]:
            # Three of the source SVGs are cp1252, not UTF-8 (a stray U+00B7
            # middle dot). Normalise on the way in so the runtime reader can
            # assume UTF-8; the originals under public/ are left alone.
            dst = SVG_DIR / f"{asset_id}.svg"
            raw = src.read_bytes()
            try:
                text = raw.decode("utf-8")
                note = "verbatim"
            except UnicodeDecodeError:
                text = raw.decode("cp1252")
                note = "re-encoded from cp1252"
            dst.write_text(text, encoding="utf-8")
            print(f"  svg   {asset_id:28} {src.stat().st_size / 1024:6.1f} KB ({note})")
            continue

        dst = DERIVATIVES / f"{asset_id}.webp"
        with Image.open(src) as im:
            im = im.convert("RGB")
            im.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
            im.save(dst, "WEBP", quality=WEBP_QUALITY, method=6)

        s, o = src.stat().st_size, dst.stat().st_size
        total_src += s
        total_out += o
        print(f"  webp  {asset_id:28} {s / 1024 / 1024:5.2f} MB -> {o / 1024:6.1f} KB")

    if missing:
        print("\nMISSING source files:", *missing, sep="\n  ")
        return 1

    print(f"\ntotal {total_src / 1024 / 1024:.1f} MB -> {total_out / 1024:.0f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
