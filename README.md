# EduCAPTCHA

Short verification pauses that teach media-literacy skills inside a social feed —
not a “truth” classifier and not a production accuracy claim.

## Architecture

```text
frontend/   React/Vite product + simulated host skins (Y, Bookface)
backend/    FastAPI, policy gates, sessions, cache, metrics, catalog
agents/     LangGraph specialists (text / image / chart) + prompts
```

```text
Host UI
  → Frontend risk client
  → FastAPI backend
  → pretriage / policy
  → agents (text | image | chart)
  → risk score / gates
  → EduCAPTCHA challenge decision
```

- **Agents** detect risk *signals*.
- **Backend** decides whether to intervene and which challenge to open.
- **Frontend** presents EduCAPTCHA and returns the user to the host action.

Y and Bookface are **simulated host skins** that prove EduCAPTCHA is host-agnostic.
They are **not** real X/Facebook API integrations.

## Local setup

```bash
cp .env.example .env
# Edit GOOGLE_API_KEY and optionally VITE_RISK_API_URL=http://127.0.0.1:8080
```

One root `.env` only. Frontend reads `VITE_*` via Vite `envDir` (repo root).
Backend resolves `PROJECT_ROOT/.env`. Agents never read `.env`.

### Frontend

```bash
cd frontend
npm ci
npm run dev          # http://127.0.0.1:5173
```

Empty `VITE_RISK_API_URL` → fully local `LearningTriggerEngine` (no network).

### Backend + agents

```bash
uv sync --frozen --all-packages
uv run --project backend uvicorn app.main:app --reload --app-dir backend --port 8080
```

`ALLOW_NO_LLM=true` runs policy-only without Gemini.

### Tests

```bash
# Frontend
cd frontend && npm run test:full   # build + unit + E2E (incl. remote project)

# Python workspace
uv run ruff check backend agents
uv run pytest backend/tests agents/tests
uv run --project backend python backend/tools/replay_corpus.py --fake --sequential

# Image (from repo root)
docker build -f backend/Dockerfile -t educaptcha-risk .
```

Secret leak guard (after a build with sentinel env vars):

```bash
cd frontend && npm run test:secrets
```

## Honest limits

- Agents do **not** determine truth/falsity.
- This is a demo / hackathon system, not a production accuracy claim.
- Cloud Run deployment is configured separately; this repo only documents env vars
  (`VITE_RISK_API_URL`, `CORS_ALLOW_ORIGINS`, `GOOGLE_API_KEY`, …).
