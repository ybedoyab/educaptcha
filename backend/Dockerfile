# syntax=docker/dockerfile:1
# Build from monorepo root:
#   docker build -f backend/Dockerfile -t educaptcha-risk .
FROM python:3.11-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
WORKDIR /app

COPY pyproject.toml uv.lock ./
COPY backend/pyproject.toml backend/pyproject.toml
COPY agents/pyproject.toml agents/pyproject.toml
COPY agents/src ./agents/src
COPY backend/app ./backend/app

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --package educaptcha-risk


FROM python:3.11-slim AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH="/app/backend"

WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY backend/app ./backend/app
COPY agents/src/educaptcha_agents ./agents/src/educaptcha_agents

RUN useradd --create-home --uid 10001 appuser && chown -R appuser /app
USER appuser

EXPOSE 8080

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1 --timeout-keep-alive 65"]
