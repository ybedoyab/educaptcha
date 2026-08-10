"""LangGraph fan-out/fan-in. Produces raw AgentSignals only — no policy scoring."""

from __future__ import annotations

import operator
from functools import lru_cache
from typing import Annotated, Any, TypedDict

from langgraph.graph import END, StateGraph

from educaptcha_agents.contracts import (
    AgentAnalysis,
    AgentContext,
    AgentMedia,
    AgentSettings,
    AgentSignal,
)
from educaptcha_agents.nodes.chart import chart_agent
from educaptcha_agents.nodes.image import image_agent
from educaptcha_agents.nodes.text import text_agent


class AgentState(TypedDict, total=False):
    context: AgentContext
    settings: AgentSettings
    media: AgentMedia | None
    pretriage_benign: bool
    raw_signals: Annotated[list[AgentSignal], operator.add]
    agents_run: Annotated[list[str], operator.add]
    agent_errors: Annotated[list[str], operator.add]


def route_agents(state: AgentState) -> list[str]:
    """Which specialists to wake. Chart is exclusive vs image."""
    if state.get("pretriage_benign"):
        return ["aggregate"]

    targets = ["text_agent"]
    media = state.get("media")
    if media is not None:
        if media.wants_chart_agent:
            targets.append("chart_agent")
        elif media.wants_image_agent:
            targets.append("image_agent")
    return targets


def aggregate_node(state: AgentState) -> dict[str, Any]:
    """Passthrough merge point — scoring lives in the backend."""
    return {}


def build_graph() -> Any:
    g: StateGraph = StateGraph(AgentState)
    g.add_node("text_agent", text_agent)
    g.add_node("image_agent", image_agent)
    g.add_node("chart_agent", chart_agent)
    g.add_node("aggregate", aggregate_node)

    g.set_conditional_entry_point(
        route_agents, path_map=["text_agent", "image_agent", "chart_agent", "aggregate"]
    )
    g.add_edge("text_agent", "aggregate")
    g.add_edge("image_agent", "aggregate")
    g.add_edge("chart_agent", "aggregate")
    g.add_edge("aggregate", END)
    return g.compile()


@lru_cache(maxsize=1)
def get_graph() -> Any:
    return build_graph()


async def analyze(context: AgentContext, settings: AgentSettings) -> AgentAnalysis:
    """Run specialists and return raw signals (+ seed heuristics)."""
    initial: AgentState = {
        "context": context,
        "settings": settings,
        "media": context.media,
        "pretriage_benign": context.pretriage_benign,
        "raw_signals": list(context.seed_signals),
        "agents_run": ["heuristic"] if context.seed_signals else [],
        "agent_errors": [],
    }
    if context.seed_signals and "heuristic" not in initial["agents_run"]:
        initial["agents_run"] = ["heuristic"]

    # Always start with heuristic marker when seed signals exist; match prior behavior.
    if not initial["agents_run"]:
        initial["agents_run"] = ["heuristic"]

    config = {"run_name": "risk_analyze", "recursion_limit": 10}
    out = await get_graph().ainvoke(initial, config=config)
    return AgentAnalysis(
        signals=list(out.get("raw_signals", [])),
        agents_run=list(out.get("agents_run", [])),
        agent_errors=list(out.get("agent_errors", [])),
    )
