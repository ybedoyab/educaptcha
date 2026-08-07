"""Zero-model pre-filter. Target < 3 ms.

On the demo corpus this decides 12 of 18 posts without touching Gemini, which is
what makes the p50 fast enough that a verification pause feels like part of the
click rather than a network round trip.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from app.schemas.risk import PostPayload
from app.schemas.signals import AgentSignal

# EN + ES markers for urgency, suppression and proof-overclaim. Compiled once
# into a single alternation — one pass over the text, not forty.
_LEXICON = re.compile(
    r"|".join(
        (
            r"\burgent\b",
            r"\burgente\b",
            r"\bbreaking\b",
            r"\búltima hora\b",
            r"share (it |this )?(now|before)",
            r"comparte (esto )?(ya|ahora|antes)",
            r"before (they|it) (delete|remove|disappear)",
            r"antes de que (lo )?(borren|quiten)",
            r"they are (trying to )?(delete|hide|silence)",
            r"est[aá]n (borrando|ocultando)",
            r"officials are hiding",
            r"las autoridades (lo )?ocultan",
            r"\bhiding\b",
            r"\bocultan\b",
            r"undeniable",
            r"innegable",
            r"\bproof\b",
            r"\bprueba\b",
            r"\bproves\b",
            r"\bexposed\b",
            r"\bexpuesto\b",
            r"send this to",
            r"env[ií]a esto a",
            r"\bLIVE\b",
            r"\ben vivo\b",
            r"right now",
            r"ahora mismo",
            r"\bwake up\b",
            r"\bdespierten\b",
            r"a source inside",
            r"una fuente dentro",
            r"before it is too late",
            r"antes de que sea tarde",
        )
    ),
    re.IGNORECASE,
)

# Shares per minute. p-alert-urgent is ~300/min; p-library is ~0.07/min.
_VELOCITY_SUSPICIOUS = 20.0
_SHORT_BODY_CHARS = 120


@dataclass
class TriageResult:
    benign: bool
    lexicon_hits: int
    velocity: float | None
    signals: list[AgentSignal]
    reason: str


def _text_of(post: PostPayload, svg_text: str | None) -> str:
    parts = [post.body.en, post.body.es, *post.tags]
    if svg_text:
        parts.append(svg_text)
    return "\n".join(parts)


def triage(
    post: PostPayload,
    *,
    has_binding: bool,
    media_analyzable: bool,
    svg_text: str | None = None,
) -> TriageResult:
    text = _text_of(post, svg_text)
    hits = len(_LEXICON.findall(text))

    velocity: float | None = None
    age = post.engagement.age_minutes
    if age is not None and age > 0:
        velocity = post.engagement.shares / age

    signals: list[AgentSignal] = []
    if velocity is not None and velocity >= _VELOCITY_SUSPICIOUS:
        # Never decides alone — a capped nudge that the aggregate can build on.
        signals.append(
            AgentSignal(
                id="share-velocity",
                skill="emotional-pressure",
                confidence=1.0,
                evidence=f"{velocity:.0f} shares/min since posting",
            )
        )

    # Benign = nothing to bind to, nothing to look at, nothing to read, and no
    # trigger vocabulary. Any one of those failing sends it to the agents.
    short_body = len(post.body.en) < _SHORT_BODY_CHARS
    benign = not has_binding and not media_analyzable and short_body and hits == 0 and not signals

    if benign:
        reason = "no binding, no analyzable media, short body, no lexicon hits"
    elif hits:
        reason = f"{hits} lexicon hit(s)"
    elif media_analyzable:
        reason = "analyzable media present"
    elif has_binding:
        reason = "post has a challenge binding"
    else:
        reason = "long body"

    return TriageResult(
        benign=benign, lexicon_hits=hits, velocity=velocity, signals=signals, reason=reason
    )
