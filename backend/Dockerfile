# syntax=docker/dockerfile:1
FROM python:3.11-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --no-install-project


FROM python:3.11-slim AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
# app/media carries the committed 768px WebP derivatives and normalised SVGs
# (~360 KB total), so the container needs no network to analyse demo imagery.
COPY app ./app

RUN useradd --create-home --uid 10001 appuser && chown -R appuser /app
USER appuser

EXPOSE 8080

# `sh -c` so ${PORT} (injected by Cloud Run) expands; `exec` so uvicorn becomes
# PID 1 and receives SIGTERM, letting the lifespan drain the metrics queue.
#
# --workers 1 is deliberate and load-bearing: the session store and analysis
# cache are in-process. With more workers, requests land on different processes,
# the cooldown counter forks, and the service starts interrupting users far more
# often than it should. Scale by instance, not by worker.
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1 --timeout-keep-alive 65"]
