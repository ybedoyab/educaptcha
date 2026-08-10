"""Risk analyzer port — backend depends on this contract, not LangGraph internals."""

from __future__ import annotations

from typing import Protocol

from educaptcha_agents import AgentAnalysis, AgentContext, AgentSettings


class RiskAnalyzer(Protocol):
    async def analyze(self, context: AgentContext, settings: AgentSettings) -> AgentAnalysis: ...
