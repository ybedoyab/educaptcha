"""Graph topology — the model layer only.

    START --(benign / no media)--> aggregate ---------------------> END
      |
      +--(analyse)--> [ text | image | chart ] --> aggregate -----> END
                      one superstep: wall time is max(agents), not the sum

Pre-triage, media resolution and the policy gates live in `app/service.py`.
They are cheap, deterministic and session-dependent, and they decide whether
this graph runs at all — so keeping them out keeps the graph purely about models.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Any

from langgraph.graph import END, StateGraph

from app.graph.nodes.agents import chart_agent, image_agent, text_agent
from app.graph.state import RiskState
from app.policy.scoring import aggregate as aggregate_signals
from app.policy.scoring import score_signal
from app.schemas.signals import AgentName

_IMAGE_SIGNALS = frozenset(
    {
        "scene-caption-mismatch",
        "stale-or-archival-cues",
        "region-mismatch",
        "object-does-not-support-claim",
        "synthetic-artifacts",
    }
)
_CHART_SIGNALS = frozenset(
    {
        "truncated-y-axis",
        "nonuniform-or-missing-scale",
        "missing-axis-labels-or-units",
        "visual-magnitude-vs-data-ratio",
    }
)


def route_agents(state: RiskState) -> list[str]:
    """Which specialists to wake.

    Chart is *exclusive*, not additive: running the image agent on a bar chart
    burns a call and reliably invents `image-context` signals that are not there.
    """
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


def _agent_for(signal_id: str) -> AgentName:
    if signal_id == "share-velocity":
        return "heuristic"
    if signal_id in _CHART_SIGNALS:
        return "chart"
    if signal_id in _IMAGE_SIGNALS:
        return "image"
    return "text"


def aggregate_node(state: RiskState) -> dict[str, Any]:
    scored = [score_signal(s, _agent_for(s.id)) for s in state.get("raw_signals", [])]
    score, dominant, per_skill = aggregate_signals(scored)
    return {"risk_score": score, "dominant_skill": dominant, "per_skill": per_skill}


def build_graph() -> Any:
    g: StateGraph = StateGraph(RiskState)
    g.add_node("text_agent", text_agent)
    g.add_node("image_agent", image_agent)
    g.add_node("chart_agent", chart_agent)
    g.add_node("aggregate", aggregate_node)

    g.set_conditional_entry_point(
        route_agents, path_map=["text_agent", "image_agent", "chart_agent", "aggregate"]
    )

    # Three INDIVIDUAL edges, deliberately. `add_edge([text, image, chart],
    # "aggregate")` builds a NamedBarrierValue that only releases once all three
    # have written, and image/chart are conditionally skipped — so the list form
    # deadlocks until the recursion limit.
    # See langgraph/graph/state.py::attach_edge.
    g.add_edge("text_agent", "aggregate")
    g.add_edge("image_agent", "aggregate")
    g.add_edge("chart_agent", "aggregate")

    g.add_edge("aggregate", END)
    return g.compile()


@lru_cache(maxsize=1)
def get_graph() -> Any:
    """Compiled once per process. Stateless single shot, so no checkpointer."""
    return build_graph()
