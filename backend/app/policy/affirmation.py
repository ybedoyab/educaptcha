"""Verbatim port of the frontend's comment classifier.

Source: `src/lib/LearningTriggerEngine.ts:43-80`. Ported rather than delegated to
the model on purpose: quizzing someone who just asked "does anyone have the
original source?" is the exact opposite of what this product is for, and a model
will occasionally do that. Source-seeking is checked first and short-circuits.
"""

from __future__ import annotations

import re

# `/…/i` in TS -> re.IGNORECASE. Patterns without the `i` flag upstream
# (/2019/, /cu[aá]ndo/, /d[oó]nde/) stay case-sensitive to preserve behaviour.
AFFIRMING_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(r"must be true", re.I),
    re.compile(r"debe ser verdad", re.I),
    re.compile(r"everyone says", re.I),
    re.compile(r"todo el mundo dice", re.I),
    re.compile(r"i saw this in several", re.I),
    re.compile(r"lo vi en varios", re.I),
    re.compile(r"share before", re.I),
    re.compile(r"comparte antes", re.I),
    re.compile(r"officials are hiding", re.I),
    re.compile(r"las autoridades lo ocultan", re.I),
    re.compile(r"prove[sd]?\b", re.I),
    re.compile(r"prueba\b", re.I),
    re.compile(r"undeniable", re.I),
    re.compile(r"innegable", re.I),
)

SOURCE_SEEKING_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(r"source\??", re.I),
    re.compile(r"fuente\??", re.I),
    re.compile(r"needs? verification", re.I),
    re.compile(r"necesita verificaci[oó]n", re.I),
    re.compile(r"2019"),
    re.compile(r"archive", re.I),
    re.compile(r"archivo", re.I),
    re.compile(r"where (was|is) this", re.I),
    re.compile(r"cu[aá]ndo"),
    re.compile(r"d[oó]nde"),
)


def is_source_seeking_comment(text: str) -> bool:
    return any(p.search(text) for p in SOURCE_SEEKING_PATTERNS)


def is_affirming_comment(text: str) -> bool:
    """A draft that repeats a claim without asking where it came from.

    Mirrors the frontend exactly: source-seeking wins, so "Does anyone have the
    original source? It must be true otherwise" is *not* affirming.
    """
    if is_source_seeking_comment(text):
        return False
    return any(p.search(text) for p in AFFIRMING_PATTERNS)
