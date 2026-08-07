from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError

from app.api.deps import (
    RateLimiter,
    get_cache,
    get_limiter,
    get_sessions,
    get_settings_dep,
)
from app.cache.ttl_cache import AnalysisCache
from app.catalog.loader import get_catalog
from app.schemas.risk import RiskAnalyzeRequest, RiskAnalyzeResponse
from app.service import analyze
from app.session.store import SessionStore
from app.settings import Settings

log = logging.getLogger(__name__)
router = APIRouter(tags=["risk"])


@router.post("/risk/analyze", response_model=RiskAnalyzeResponse)
async def risk_analyze(
    req: RiskAnalyzeRequest,
    settings: Settings = Depends(get_settings_dep),
    sessions: SessionStore = Depends(get_sessions),
    cache: AnalysisCache = Depends(get_cache),
    limiter: RateLimiter = Depends(get_limiter),
) -> RiskAnalyzeResponse:
    if not limiter.allow(req.session.id):
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS, detail="rate limit exceeded for this session"
        )

    try:
        return await analyze(req, settings=settings, sessions=sessions, cache=cache)
    except ValidationError as exc:
        # A challenge id outside the catalog cannot be serialised (ChallengeId is
        # a Literal). Returning "continue" is strictly better than shipping an id
        # the frontend will silently wedge on.
        log.error("decision failed validation, degrading to continue: %s", exc)
        return RiskAnalyzeResponse.model_validate(
            {
                "decision": {"outcome": "continue", "shouldIntervene": False},
                "diagnostics": {
                    "riskScore": 0.0,
                    "threshold": settings.risk_threshold,
                    "gate": "agent-error",
                    "path": "fallback",
                    "latencyMs": 0,
                },
                "session": {
                    "id": req.session.id,
                    "actionsSinceLastIntervention": 0,
                    "recentSkills": [],
                },
            }
        )


@router.get("/catalog")
async def catalog() -> dict[str, object]:
    """Lets the frontend assert at boot that both sides agree on the id set."""
    c = get_catalog()
    return {
        "catalogVersion": c.catalog_version,
        "challengeIds": c.challenge_ids,
        "skills": c.skills,
        "actionableSkills": c.actionable_skills,
    }
