"""Bilingual reason copy, aligned with frontend `reasonFor()`.

Source: `frontend/src/lib/LearningTriggerEngine.ts`.

The model does not write these. They are product strings in two languages that
Playwright matches with bilingual regexes, and generating them per request would
make the UI non-deterministic. Agents stay behind the scenes — copy is
verification-oriented, not “AI found…” reveal language.
"""

from __future__ import annotations

from app.schemas.common import ActionType, LocalizedText, SkillId

_IMAGE_SKILLS: frozenset[str] = frozenset({"image-context", "wildfire-context", "protest-context"})

_SHARE_BY_SKILL: dict[str, LocalizedText] = {
    "image": LocalizedText(
        en=("Before you share, check this photo. This image may be old or out of context."),
        es=(
            "Antes de compartir, revisa esta foto. "
            "Esta imagen puede ser antigua o estar fuera de contexto."
        ),
    ),
    "wildfire-context": LocalizedText(
        en=(
            "Before you share, check this photo. "
            "The caption names one place, but visual cues may point elsewhere."
        ),
        es=(
            "Antes de compartir, revisa esta foto. "
            "El texto nombra un lugar, pero las señales visuales pueden apuntar a otro."
        ),
    ),
    "emotional-pressure": LocalizedText(
        en="Before you share, notice how this post is asking you to react.",
        es="Antes de compartir, fíjate cómo este post te pide reaccionar.",
    ),
    "misleading-chart": LocalizedText(
        en="Before you share, check how this chart is scaled.",
        es="Antes de compartir, revisa cómo está escalada esta gráfica.",
    ),
    "vaccine-claim": LocalizedText(
        en=("Before you share, compare what the photo shows with what the caption claims."),
        es=("Antes de compartir, compara lo que muestra la foto con lo que afirma el pie."),
    ),
}

_COMMENT = LocalizedText(
    en=(
        "Your draft repeats the claim without identifying its source. "
        "Edit or verify before posting."
    ),
    es=(
        "Tu borrador repite la afirmación sin identificar su fuente. "
        "Edita o verifica antes de publicar."
    ),
)

_REPOST = LocalizedText(
    en="Before you reshare, check whether this image still has its original context.",
    es="Antes de volver a compartir, revisa si esta imagen conserva su contexto original.",
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
        if skill == "wildfire-context":
            return _SHARE_BY_SKILL["wildfire-context"]
        if skill in _IMAGE_SKILLS:
            return _SHARE_BY_SKILL["image"]
        if skill in _SHARE_BY_SKILL:
            return _SHARE_BY_SKILL[skill]

    if action == "comment" and comment_text:
        return _COMMENT

    if action == "repost-image":
        return _REPOST

    return _FALLBACK
