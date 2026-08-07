"""Resolve `mediaAssetId` to something a model can actually read.

Two paths, deliberately:

* **raster** -> a 768px WebP derivative, base64'd. The source photos are
  1.7-6.9 MB; Gemini tiles at 768px, so shipping the originals would be pure
  latency. Derivatives are committed under `derivatives/`.
* **svg** -> the XML source, handed over as *text*. Gemini vision rejects
  `image/svg+xml`, and these files are ~1 KB containing the literal answer
  (`misleading-chart-preview.svg` says `Axis starts at 84` and carries the bar
  heights as attributes). Reading them as text is faster and more accurate.

The registry's `alt` text is deliberately NOT exposed here: it contains the
ground-truth date and location, which would turn image analysis into a lookup.
"""

from __future__ import annotations

import base64
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from app.catalog.loader import get_catalog
from app.schemas.common import MediaKind

_MEDIA_DIR = Path(__file__).parent
DERIVATIVES = _MEDIA_DIR / "derivatives"
SVG_DIR = _MEDIA_DIR / "svg"

# Media kinds that can carry a photograph worth inspecting.
_RASTER_KINDS: frozenset[str] = frozenset({"photo", "video", "official", "document"})


@dataclass(frozen=True)
class ResolvedMedia:
    asset_id: str
    kind: MediaKind
    analyzable: bool
    is_svg: bool
    #: base64 WebP, set only for rasters
    data_b64: str | None = None
    mime: str | None = None
    #: raw XML, set only for SVGs
    svg_text: str | None = None

    @property
    def has_raster(self) -> bool:
        return self.data_b64 is not None

    @property
    def wants_image_agent(self) -> bool:
        return self.analyzable and self.has_raster and self.kind in _RASTER_KINDS

    @property
    def wants_chart_agent(self) -> bool:
        return self.analyzable and self.kind == "chart"


@lru_cache(maxsize=64)
def _read_b64(path: Path) -> str:
    return base64.b64encode(path.read_bytes()).decode("ascii")


@lru_cache(maxsize=64)
def _read_text(path: Path) -> str:
    """Build-time normalises SVGs to UTF-8; cp1252 fallback in case one slips through."""
    raw = path.read_bytes()
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        return raw.decode("cp1252", errors="replace")


def resolve_media(asset_id: str | None, kind: MediaKind) -> ResolvedMedia | None:
    """Unknown or missing assets return a non-analyzable stub, never an error.

    A host platform will send ids this service has never seen; that must degrade
    to text-only analysis rather than failing the request.
    """
    if asset_id is None:
        return None

    entry = get_catalog().media.get(asset_id)
    if entry is None:
        return ResolvedMedia(asset_id=asset_id, kind=kind, analyzable=False, is_svg=False)

    if entry.is_svg:
        path = SVG_DIR / f"{asset_id}.svg"
        if not path.exists():
            return ResolvedMedia(asset_id=asset_id, kind=kind, analyzable=False, is_svg=True)
        return ResolvedMedia(
            asset_id=asset_id,
            kind=kind,
            analyzable=entry.analyzable,
            is_svg=True,
            svg_text=_read_text(path),
        )

    path = DERIVATIVES / f"{asset_id}.webp"
    if not path.exists():
        return ResolvedMedia(asset_id=asset_id, kind=kind, analyzable=False, is_svg=False)
    return ResolvedMedia(
        asset_id=asset_id,
        kind=kind,
        analyzable=entry.analyzable,
        is_svg=False,
        data_b64=_read_b64(path),
        mime="image/webp",
    )
