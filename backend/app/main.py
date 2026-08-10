from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import routes_metrics, routes_risk
from app.api.deps import VAR_DIR, RateLimiter
from app.cache.ttl_cache import AnalysisCache
from app.metrics.sink import QueuedSink, build_sink
from app.session.store import MemorySessionStore
from app.settings import get_settings

log = logging.getLogger(__name__)


def _configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)-7s %(name)s %(message)s",
    )


def _configure_tracing(settings: Any) -> None:
    """LangSmith is env-driven; mirror our settings into the vars it reads."""
    import os

    if settings.langsmith_tracing and settings.langsmith_api_key:
        os.environ["LANGSMITH_TRACING"] = "true"
        os.environ["LANGSMITH_ENDPOINT"] = settings.langsmith_endpoint
        os.environ["LANGSMITH_API_KEY"] = settings.langsmith_api_key
        os.environ["LANGSMITH_PROJECT"] = settings.langsmith_project
        log.info("LangSmith tracing enabled (project=%s)", settings.langsmith_project)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    settings.validate_startup()
    _configure_logging(settings.log_level)
    _configure_tracing(settings)

    app.state.settings = settings
    app.state.sessions = MemorySessionStore(
        ttl_seconds=settings.session_ttl_seconds, max_entries=settings.session_max_entries
    )
    app.state.cache = AnalysisCache(
        maxsize=settings.cache_max_entries, ttl=settings.cache_ttl_seconds
    )
    app.state.limiter = RateLimiter(settings.rate_limit_per_min)

    metrics = QueuedSink(build_sink(settings, var_dir=VAR_DIR))
    metrics.start()
    app.state.metrics = metrics

    log.info(
        "risk service up: model=%s llm=%s threshold=%.2f cooldown=%d",
        settings.gemini_model,
        "on" if settings.llm_enabled else "OFF (deterministic policy only)",
        settings.risk_threshold,
        settings.cooldown_actions,
    )

    # No server-side prewarm: the service does not own the post corpus, the
    # caller does. Warming is client-driven instead — the frontend fires
    # `dryRun: true` requests as the feed mounts, which populates this same
    # cache without touching session counters, so the real click hits it warm.

    try:
        yield
    finally:
        await metrics.aclose()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="EduCAPTCHA risk service",
        version="0.1.0",
        summary=(
            "Decides whether a verification pause is worth showing, and which skill to practise."
        ),
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        # The session id travels in the body, not a cookie — which is exactly
        # why credential-less CORS is safe here.
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["content-type"],
    )
    app.include_router(routes_risk.router)
    app.include_router(routes_metrics.router)

    # Two paths, one handler. Google's edge intercepts the exact path /healthz on
    # *.run.app and answers it with its own 404, so the request never reaches this
    # container — verified against the deployed revision, where /healthz returns
    # Google's HTML error page while /healthz/ (307) and every other route reach
    # the app normally. /ops/healthz is what the deployed smoke test hits;
    # /healthz stays for local dev and existing tooling.
    @app.get("/healthz", tags=["ops"])
    @app.get("/ops/healthz", tags=["ops"])
    async def healthz() -> dict[str, object]:
        return {
            "ok": True,
            "llm": settings.llm_enabled,
            "model": settings.gemini_model,
            "threshold": settings.risk_threshold,
        }

    return app


app = create_app()
