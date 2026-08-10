"""Model factory. Configuration is injected — agents never read .env."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any, Protocol

from educaptcha_agents.contracts import AgentSettings


class StructuredModel(Protocol):
    async def ainvoke(self, input: Any, config: Any = None, **kwargs: Any) -> Any: ...


class ModelFactory(Protocol):
    def __call__(self, settings: AgentSettings, schema: type) -> StructuredModel: ...


def _real_factory(settings: AgentSettings, schema: type) -> StructuredModel:
    from langchain_google_genai import ChatGoogleGenerativeAI

    llm = ChatGoogleGenerativeAI(
        model=settings.model,
        api_key=settings.api_key,
        temperature=settings.temperature,
        thinking_level=settings.thinking_level,
        max_output_tokens=400,
        timeout=60.0,
        max_retries=1,
    )
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


def get_model(settings: AgentSettings, schema: type) -> StructuredModel:
    return LLM_FACTORY(settings, schema)
