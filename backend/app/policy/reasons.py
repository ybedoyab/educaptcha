"""Bilingual reason copy, ported verbatim from `reasonFor()`.

Source: `src/lib/LearningTriggerEngine.ts:82-136`.

The model does not write these. They are product strings in two languages that
Playwright matches with bilingual regexes, and generating them per request would
make the UI non-deterministic and put Spanish quality at the mercy of a sampling
coin flip. The agents' `evidence` goes to `diagnostics` instead, so the demo can
still show *why* without shipping model output as copy.
"""

from __future__ import annotations

from app.schemas.common import ActionType, LocalizedText, SkillId

_IMAGE_SKILLS: frozenset[str] = frozenset({"image-context", "wildfire-context", "protest-context"})

_SHARE_BY_SKILL: dict[str, LocalizedText] = {
    "image": LocalizedText(
        en="Before sharing this image, check when and where it was taken.",
        es="Antes de compartir esta imagen, comprueba cuándo y dónde fue tomada.",
    ),
    "emotional-pressure": LocalizedText(
        en="This post uses urgency before offering a verifiable source.",
        es="Esta publicación usa urgencia antes de ofrecer una fuente verificable.",
    ),
    "misleading-chart": LocalizedText(
        en="Before sharing this chart, check where the vertical axis starts.",
        es="Antes de compartir esta gráfica, revisa dónde empieza el eje vertical.",
    ),
    "vaccine-claim": LocalizedText(
        en="Before sharing, separate what the photo shows from what the caption claims.",
        es="Antes de compartir, separa lo que muestra la foto de lo que afirma el pie.",
    ),
}

_COMMENT = LocalizedText(
    en="Your draft repeats the claim without identifying its source.",
    es="Tu borrador repite la afirmación sin identificar su fuente.",
)

_REPOST = LocalizedText(
    en="This image may be authentic but missing its original context.",
    es="Esta imagen puede ser auténtica, pero carecer de su contexto original.",
)

_FALLBACK = LocalizedText(
    en="A short verification check can help before you continue.",
    es="Una breve revisión de verificación puede ayudar antes de continuar.",
)

VERIFY_ACK = LocalizedText(
    en="Good instinct — verify the original source before sharing.",
    es="Buen instinto — verifica la fuente original antes de compartir.",
)


def reason_for(
    action: ActionType, skill: SkillId | None, comment_text: str | None = None
) -> LocalizedText:
    """Mirrors `reasonFor(action, post, commentText)` branch for branch."""
    if action == "share":
        if skill in _IMAGE_SKILLS:
            return _SHARE_BY_SKILL["image"]
        if skill in _SHARE_BY_SKILL:
            return _SHARE_BY_SKILL[skill]

    if action == "comment" and comment_text:
        return _COMMENT

    if action == "repost-image":
        return _REPOST

    return _FALLBACK
