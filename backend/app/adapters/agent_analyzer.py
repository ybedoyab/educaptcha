"""Adapter: educaptcha_agents behind the RiskAnalyzer port."""

from __future__ import annotations

from educaptcha_agents import AgentAnalysis, AgentContext, AgentSettings, analyze


class AgentRiskAnalyzer:
    async def analyze(self, context: AgentContext, settings: AgentSettings) -> AgentAnalysis:
        return await analyze(context, settings)


default_analyzer = AgentRiskAnalyzer()
