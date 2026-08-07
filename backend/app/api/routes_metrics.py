from __future__ import annotations

from fastapi import APIRouter, Depends, status

from app.api.deps import get_metrics
from app.metrics.sink import MetricsSink
from app.schemas.metrics import MetricAck, MetricEvent

router = APIRouter(tags=["metrics"])


@router.post("/metrics/event", status_code=status.HTTP_202_ACCEPTED, response_model=MetricAck)
async def metrics_event(event: MetricEvent, sink: MetricsSink = Depends(get_metrics)) -> MetricAck:
    """Record one anonymous outcome.

    The `MetricEvent` schema is closed (`extra="forbid"`) and has no free-text
    field, so this endpoint physically cannot receive post bodies, comment text,
    user ids, IPs or user agents. Enqueued and acknowledged immediately; the
    write happens on a background drain task.
    """
    await sink.write(event)
    return MetricAck(sink=sink.name)
