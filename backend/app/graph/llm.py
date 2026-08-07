"""Model factory, and the seam tests substitute a fake through.

`LLM_FACTORY` is module-level and swappable so `tests/fakes/fake_llm.py` can
inject a deterministic model without patching LangChain internals.
"""

from __future__ import annotations

from collections.abc import Callable
from typing import Any, Protocol

from app.settings import Settings


class StructuredModel(Protocol):
    """Just enough of a Runnable for the agents' needs."""

    async def ainvoke(self, input: Any, config: Any = None, **kwargs: Any) -> Any: ...


class ModelFactory(Protocol):
    def __call__(self, settings: Settings, schema: type) -> StructuredModel: ...


def _real_factory(settings: Settings, schema: type) -> StructuredModel:
    from langchain_google_genai import ChatGoogleGenerativeAI

    llm = ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        api_key=settings.google_api_key,
        temperature=settings.gemini_temperature,
        # Flash defaults to "medium" thinking. Leaving that on is a silent
        # multi-second tax per call and the single biggest latency mistake here.
        thinking_level=settings.gemini_thinking_level,
        max_output_tokens=400,
        # NOT our latency budget. The Gemini API rejects any manually set
        # deadline under 10s with a 400 INVALID_ARGUMENT, so passing our real
        # ~2s budget here fails every call outright. This is only a backstop
        # against a hung socket; the budget that matters is enforced with
        # asyncio.wait_for in `_run`, which we control.
        timeout=60.0,
        max_retries=1,
    )
    # thinking_level survives with_structured_output (upstream pins this in a test).
    return llm.with_structured_output(schema, method="json_schema")  # type: ignore[return-value]


LLM_FACTORY: ModelFactory = _real_factory


def set_factory(factory: ModelFactory) -> Callable[[], None]:
    """Swap the factory; returns a restore callable."""
    global LLM_FACTORY
    previous = LLM_FACTORY
    LLM_FACTORY = factory

    def restore() -> None:
        global LLM_FACTORY
        LLM_FACTORY = previous

    return restore


def get_model(settings: Settings, schema: type) -> StructuredModel:
    return LLM_FACTORY(settings, schema)
