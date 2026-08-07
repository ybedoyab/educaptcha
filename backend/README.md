# EduCAPTCHA risk service

Decides **whether a verification pause is worth showing** for a given action on
a given post, and **which media-literacy skill** it should practise.

It is explicitly **not** a truth classifier. It looks for rhetorical, sourcing
and visual patterns that make a reader more likely to share before checking, and
it stays quiet unless the risk clears a tunable threshold.

## Run it

```bash
cd backend
uv sync
cp .env.example .env          # add GOOGLE_API_KEY (AI Studio; no GCP project needed)
uv run uvicorn app.main:app --reload --port 8080
```

No key handy? `ALLOW_NO_LLM=true` runs the deterministic policy layer alone —
real endpoints, real gates, real bilingual copy, zero model calls. Enough to
develop the frontend against.

```bash
uv run pytest                                          # 64 tests, no network, no spend
uv run python tools/replay_corpus.py --fake --sequential   # decision table
uv run python tools/replay_corpus.py --live --fresh-session
```

## Endpoints

| | |
|---|---|
| `POST /risk/analyze` | the decision. Request/response documented at `/docs` |
| `POST /metrics/event` | anonymous outcome, `202` and enqueued |
| `GET /catalog` | the 12 challenge ids, for a boot-time parity check |
| `GET /healthz` | liveness + effective config |

## How a decision is made

```
pretriage (no model, <3ms)
   │   decides 12 of the 18 demo posts outright
   ▼
gates 1-9 (verify-link, save, guided, cooldown, no-repeat-skill, …)
   │   suppressed here -> no model call at all
   ▼
LangGraph fan-out, one superstep      text ─┐
   │   chart is exclusive, never       image ├─> aggregate
   │   alongside image                 chart ─┘
   ▼
noisy-OR within skill, max across skills -> riskScore
   ▼
gates 11-13 (threshold, challenge resolution) -> continue | intercept | verify-ack
```

Everything outside the fan-out is deterministic. The gates are invariants, not
judgements, so an LLM orchestrator would own nothing but one float comparison —
where it would be slower, unauditable, and would turn the agents' parallel
`max()` latency into a `sum()`. `RISK_THRESHOLD` is the knob instead.

## Things that are easy to get wrong

- **Challenge choice is post-bound first, skill-bound second.** `p-inside` is
  `emotional-pressure` but binds to `ep-transfer`, not `ep-spot`; `p-flood-today`
  binds to `ic-transfer`. A skill→challenge table alone sends the wrong minigame.
- **Signal ids are a closed enum.** With a bare `str`, Gemini returns things like
  `artificial_urgency_sharing_pressure`, which score 0.0 and silently collapse
  every risk score to zero.
- **The Gemini API rejects a client deadline under 10s** with a 400. Our real
  budget is enforced with `asyncio.wait_for`; the SDK timeout is only a socket
  backstop.
- **Never `add_edge([a, b, c], "aggregate")`.** The list form builds a barrier
  that waits for all three, and image/chart are conditionally skipped — it
  deadlocks. Three individual edges.
- **A challenge id the frontend doesn't have is unrecoverable in the UI.**
  `ChallengeId` is a `Literal`, so an unknown id cannot be serialised; it raises
  and the route degrades to `continue`.
- **`--workers 1` is load-bearing.** The session store and cache are in-process;
  more workers fork the cooldown counter. Scale by instance.

## Latency

A cold analysis is ~2–6s, dominated by network round-trip (thinking level barely
moves it). That is far too slow to sit on a click, so the browser prefetches with
`dryRun: true` as the feed mounts — the service caches the analysis without
advancing any counter, and the real click reads it in ~5ms.

Measured on the corpus: p50 ~2ms, p95 ~36ms warm; 12 of 18 posts never reach a
model at all.

## Regenerating the generated files

```bash
node tools/export_catalog.mjs           # catalog.json + tests/fixtures/corpus.json
uv run python tools/build_derivatives.py  # 24.7 MB of JPEG -> 358 KB of WebP
uv run python tools/record_cassettes.py   # one real pass; the diff reviews prompt changes
```

## Deploy

`scripts/deploy_cloud_run.sh` has the full sequence. The runtime service account
needs `roles/datastore.user` and `roles/secretmanager.secretAccessor`; the human
deploying needs `iam.serviceAccountUser`, which is the one people forget.
