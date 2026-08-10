"""Runtime configuration. Every tunable lives here so demo-day knobs are env vars."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/app/settings.py -> parents[2] == monorepo root
PROJECT_ROOT = Path(__file__).resolve().parents[2]
ROOT_ENV = PROJECT_ROOT / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ROOT_ENV,
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # ── server ──
    port: int = 8080
    env: Literal["local", "test", "cloudrun"] = "local"
    log_level: str = "INFO"
    cors_allow_origins: str = "http://localhost:5173,http://127.0.0.1:4173"
    rate_limit_per_min: int = 30

    # ── model ──
    google_api_key: str | None = None
    gemini_model: str = "gemini-3.5-flash"
    gemini_thinking_level: Literal["minimal", "low", "medium", "high"] = "minimal"
    gemini_temperature: float = 0.0
    llm_timeout_ms: int = 8000
    graph_deadline_ms: int = 9000
    allow_no_llm: bool = False

    # ── policy ──
    risk_threshold: float = Field(default=0.55, ge=0.0, le=1.0)
    cooldown_actions: int = Field(default=3, ge=0)
    no_repeat_skill: bool = True
    orchestrator_mode: Literal["rules", "llm"] = "rules"
    shadow_mode_on_suppressed: bool = False
    feed_alt_text_to_vision: bool = False
    reason_mode: Literal["static", "llm"] = "static"

    # ── cache / session ──
    cache_ttl_seconds: int = 1800
    cache_max_entries: int = 512
    prewarm_cache: bool = True
    session_ttl_seconds: int = 1800
    session_max_entries: int = 2000

    # ── metrics ──
    metrics_sink: Literal["auto", "firestore", "jsonl", "noop"] = "auto"
    google_cloud_project: str | None = None
    metrics_collection: str = "educaptcha_events"

    # ── tracing ──
    langsmith_tracing: bool = False
    langsmith_api_key: str | None = None
    langsmith_project: str = "educaptcha-risk"

    @field_validator("google_api_key", "google_cloud_project", "langsmith_api_key", mode="before")
    @classmethod
    def _blank_to_none(cls, v: object) -> object:
        if isinstance(v, str) and not v.strip():
            return None
        return v

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_allow_origins.split(",") if o.strip()]

    @property
    def llm_enabled(self) -> bool:
        return not self.allow_no_llm and bool(self.google_api_key)

    def validate_startup(self) -> None:
        if not self.allow_no_llm and not self.google_api_key:
            raise RuntimeError(
                "GOOGLE_API_KEY is not set. Set it in the root .env, or set ALLOW_NO_LLM=true "
                "to run the deterministic policy-only backend (no model calls)."
            )


@lru_cache
def get_settings() -> Settings:
    return Settings()
