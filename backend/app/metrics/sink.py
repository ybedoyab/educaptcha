"""Metric sinks. Chosen once at startup; never block a request."""

from __future__ import annotations

import asyncio
import json
import logging
from datetime import UTC, datetime
from pathlib import Path
from typing import Protocol

from app.schemas.metrics import MetricEvent
from app.settings import Settings

log = logging.getLogger(__name__)


class MetricsSink(Protocol):
    name: str

    async def write(self, event: MetricEvent) -> None: ...
    async def aclose(self) -> None: ...


class NoopSink:
    name = "noop"

    async def write(self, event: MetricEvent) -> None:  # noqa: ARG002
        return None

    async def aclose(self) -> None:
        return None


class JsonlSink:
    """Append-only local file. Good enough offline; lost when an instance recycles."""

    name = "jsonl"

    def __init__(self, directory: Path) -> None:
        self._dir = directory
        self._dir.mkdir(parents=True, exist_ok=True)

    async def write(self, event: MetricEvent) -> None:
        day = datetime.now(UTC).strftime("%Y-%m-%d")
        path = self._dir / f"events-{day}.jsonl"
        line = json.dumps(event.model_dump(by_alias=True, mode="json"), separators=(",", ":"))
        await asyncio.to_thread(_append, path, line)

    async def aclose(self) -> None:
        return None


def _append(path: Path, line: str) -> None:
    with path.open("a", encoding="utf-8") as fh:
        fh.write(line + "\n")


class FirestoreSink:
    """One doc per event plus a daily counter doc.

    A ULID document id keeps events time-ordered without needing an index, and
    the daily aggregate means the dashboard reads one document instead of running
    a query that would demand a composite index.
    """

    name = "firestore"

    def __init__(self, project: str, collection: str) -> None:
        from google.cloud import firestore  # imported lazily: optional dependency

        self._db = firestore.AsyncClient(project=project)
        self._collection = collection
        self._increment = firestore.Increment

    async def write(self, event: MetricEvent) -> None:
        from ulid import ULID

        payload = event.model_dump(by_alias=True, mode="json")
        payload["serverReceivedAt"] = datetime.now(UTC)

        doc_id = f"{event.session_id}:{ULID()}"
        await self._db.collection(self._collection).document(doc_id).set(payload)

        day = datetime.now(UTC).strftime("%Y-%m-%d")
        counters: dict[str, object] = {"events": self._increment(1)}
        if event.event == "intervention_shown":
            counters["intercepts"] = self._increment(1)
        if event.event == "intervention_skipped":
            counters["skips"] = self._increment(1)
        if event.event == "challenge_completed":
            counters["completions"] = self._increment(1)
        if event.skill:
            counters[f"bySkill.{event.skill}"] = self._increment(1)
        if event.gate:
            counters[f"byGate.{event.gate}"] = self._increment(1)
        await self._db.collection("educaptcha_daily").document(day).set(counters, merge=True)

    async def aclose(self) -> None:
        self._db.close()


def build_sink(settings: Settings, *, var_dir: Path) -> MetricsSink:
    """Silent fallback, loud log — never crash on a missing cloud dependency."""
    choice = settings.metrics_sink
    if choice == "noop":
        return NoopSink()
    if choice == "jsonl":
        return JsonlSink(var_dir / "metrics")

    if choice in {"auto", "firestore"} and settings.google_cloud_project:
        try:
            sink = FirestoreSink(settings.google_cloud_project, settings.metrics_collection)
            log.info("metrics sink = firestore (project=%s)", settings.google_cloud_project)
            return sink
        except Exception as exc:  # noqa: BLE001
            if choice == "firestore":
                raise
            log.warning("firestore sink unavailable (%s); falling back to jsonl", exc)

    log.info("metrics sink = jsonl (no GOOGLE_CLOUD_PROJECT)")
    return JsonlSink(var_dir / "metrics")


class QueuedSink:
    """Bounded queue + background drain, so a slow write never blocks a request."""

    def __init__(self, inner: MetricsSink, maxsize: int = 1000) -> None:
        self._inner = inner
        self._q: asyncio.Queue[MetricEvent] = asyncio.Queue(maxsize=maxsize)
        self._task: asyncio.Task[None] | None = None
        self.dropped = 0

    @property
    def name(self) -> str:
        return self._inner.name

    def start(self) -> None:
        self._task = asyncio.create_task(self._drain())

    async def _drain(self) -> None:
        while True:
            event = await self._q.get()
            try:
                await self._inner.write(event)
            except Exception as exc:  # noqa: BLE001
                log.warning("metrics write failed: %s", exc)
            finally:
                self._q.task_done()

    async def write(self, event: MetricEvent) -> None:
        try:
            self._q.put_nowait(event)
        except asyncio.QueueFull:
            self.dropped += 1
            log.warning("metrics queue full; dropped %d events so far", self.dropped)

    async def aclose(self) -> None:
        if self._task is not None:
            try:
                await asyncio.wait_for(self._q.join(), timeout=5)
            except TimeoutError:
                log.warning("metrics queue did not drain before shutdown")
            self._task.cancel()
        await self._inner.aclose()
