# EduCAPTCHA deployment

MVP demo deployment. One GCP project (`educaptcha`, number `850648364864`), one
region (`us-central1`), six services.

```
browser
  └─ https://educaptcha.web.app/                 Firebase Hosting → frontend/dist
     ├─ /risk/**    ─┐
     ├─ /metrics/** ─┼─ rewrite ─→ Cloud Run  educaptcha-risk  (FastAPI + agents)
     └─ /healthz    ─┘                             ├─ Secret Manager  GOOGLE_API_KEY
                                                   └─ Gemini          generativelanguage
```

The SPA and the risk service share an origin, so the browser never makes a
cross-origin request and `VITE_RISK_API_URL` is just `/` — no Cloud Run URL is
baked into the public bundle.

## What is here, and what was deliberately left out

| Service | Why |
|---|---|
| Cloud Run | Runs the FastAPI service. |
| Firebase Hosting | Free tier + CDN for the 32 MB of demo assets; hosts the rewrite that makes this single-origin. |
| Artifact Registry | Cloud Run can only deploy an image that already lives in a registry. Not optional — `gcloud run deploy --source` only makes it implicit by routing through Cloud Build, which creates its own repo and adds a service. |
| Secret Manager | Keeps the Gemini key out of the service config, out of shell history, and out of Terraform state. |
| Cloud Storage | One bucket, Terraform remote state. |
| IAM | One runtime service account holding exactly one permission. |

## First-time setup

Prerequisites: `terraform >= 1.9`, `gcloud`, `docker`, Node 20+.

The order below matters. **Cloud Run refuses to create a revision that
references a secret with no versions**, so the Gemini key has to exist before
the service does — hence the targeted apply in step 2.

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project educaptcha

# 1. configure
cd infra
cp terraform.tfvars.example terraform.tfvars
terraform init

# 2. create just the secret container (and the APIs it depends on)
terraform apply -target=google_secret_manager_secret.google_api_key

# 3. put the key in it — Terraform creates secret *containers*, never values,
#    so no key touches state or git
printf '%s' 'YOUR_GEMINI_KEY' | \
  gcloud secrets versions add educaptcha-google-api-key --data-file=- --project=educaptcha

# 4. everything else, now that the secret resolves
terraform apply

# 5. build and ship
cd .. && ./deploy.sh
```

Most of the first apply is API enablement. Cloud Run comes up on a placeholder
image; the first `./deploy.sh` replaces it.

`ALLOW_NO_LLM=false` in the deployed service means `validate_startup()` fails
fast without the key — the container refuses to boot rather than silently
serving policy-only verdicts, and Cloud Run reports it as "failed to start and
listen on the port". `deploy.sh` checks for `"llm":true` on `/healthz` and fails
the deploy if the secret never arrived.

`deploy.sh` also refuses to run before Terraform: `gcloud run deploy` would
otherwise *create* a bare service with no env and the default compute SA, which
crashes on startup for exactly this reason.

Note the Gemini key normally belongs to whichever project minted it — likely
`gen-lang-client-0987079969`, not this one. That is fine; the key carries its own
project, and quota applies there.

For LangSmith, add a version to `educaptcha-langsmith-api-key`, then set
`enable_langsmith = true` and re-apply. Doing it in the other order fails:
Cloud Run rejects a revision referencing a secret with no versions.

### Move state to GCS

The first apply creates `educaptcha-tfstate`. Then uncomment the `backend "gcs"`
block in `versions.tf` and:

```bash
terraform init -migrate-state
```

> **This migration never happened, and the state is not in this repo.** As of
> 2026-08-16: `gs://educaptcha-tfstate/` exists but is **empty**, the
> `backend "gcs"` block is still commented out, and there is no local
> `terraform.tfstate` or `terraform.tfvars` on this machine.
>
> That is expected rather than alarming — `infra/.gitignore` correctly excludes
> `*.tfstate` and `terraform.tfvars`, so state was never meant to be in git. It
> means the only copy lives **on the machine of whoever ran the first apply**.
> The audit log attributes the original apply (2026-08-10 18:11 UTC) to
> `jfquintero261@gmail.com`, so start there.
>
> Until that state is in the bucket, do **not** run a bare `terraform apply` from
> a fresh checkout: with empty state it plans to *create* everything and will
> fail against the resources that already exist. Recover it in this order:
>
> 1. Get `terraform.tfstate` from the machine that has it, or reconstruct it with
>    `terraform import` (service, runtime SA, IAM bindings, secrets, registry,
>    bucket).
> 2. Uncomment `backend "gcs"` and run `terraform init -migrate-state`, so the
>    single copy stops being one laptop away from gone.
>
> Meanwhile treat `cloud_run.tf` as the *intended* spec, not a description of
> what is deployed, and confirm live config with `gcloud run services describe`.

## Deploying

From the repo root:

```bash
./deploy.sh              # backend image + Cloud Run, then frontend + Hosting
./deploy.sh backend      # image only
./deploy.sh frontend     # SPA only
```

It tags the image with the current short SHA, pushes to Artifact Registry, swaps
the Cloud Run image, smoke-tests `/healthz`, then builds the frontend with
`VITE_RISK_API_URL=/` and publishes to Hosting.

## Division of ownership

Terraform owns the service's environment, secrets, scaling, and identity.
`deploy.sh` owns only the image tag — `cloud_run.tf` has `ignore_changes` on
`template[0].containers[0].image` so an apply after a deploy does not roll the
service back to whatever `var.image` last held.

Changing a policy knob (threshold, cooldown, rate limit) is a `terraform apply`,
not a `gcloud run services update` — the latter gets reverted by the next apply.

`infra/demo.sh` is the one sanctioned exception, and only for `min-instances`.
It works precisely *because* an apply reverts it: Terraform declares the resting
state as `min_instances = 0`, so drift can only ever resolve toward scale-to-zero
and a demo pin left on gets cancelled rather than entrenched. Do not extend the
script to other settings — for anything else, the rule above still holds.

## Cost

`min_instances` is the only line with a standing bill, and it defaults to **0**.

It used to be 1, and that was measured at **~5,555 COP / ~$1.73 USD per day —
about $52 a month** — on days the service served *zero* requests. Not an
estimate: `billable_instance_time` read 86,383 s on a day with 0 requests, a
full 24 h. Two settings combine to produce it:

- `min_instance_count = 1` keeps an instance alive forever, and
- `cpu_idle = false` bills the whole lifecycle at the active rate instead of the
  reduced idle rate — Cloud Run reports the instance as `active` 100% of the
  time, never `idle`.

At 1 vCPU + 1 GiB that is `86,400 × $0.000018` CPU + `86,400 × $0.0000020`
memory. The monthly free tier (240,000 vCPU-s) covers only 2.8 days, so from
roughly the 4th of each month you pay the full daily rate.

Scaling to zero never *breaks* anything: the feed prefetches every post with
`dryRun` on mount, and a cache miss inside `CLICK_TIMEOUT_MS` (4.5 s) falls back
to the local engine rather than stalling.

It does change what a cold visitor exercises, though. **A cold start measures
~13 s** (`run.googleapis.com/container/startup_latencies`, 2026-08-16). The
prefetch cannot hide that behind a 4.5 s timeout, so the first interaction on a
cold service takes the local fallback and the agent backend is never reached.
Nothing looks broken — which is exactly why it is worth knowing before a demo.

### Warming up for a demo

```bash
./infra/demo.sh status   # min-instances, health, and the standing cost if any
./infra/demo.sh warm     # wake it now, no config change, no standing cost
./infra/demo.sh on       # pin one warm instance — STARTS THE DAILY BILL
./infra/demo.sh off      # back to zero
```

**Run `warm` before any demo.** It is not an optimisation — given the ~13 s cold
start above, it is the difference between judges seeing the agent service and
judges seeing the local fallback. An idle instance then survives up to ~15 min
after the last request, which covers a pitch you are walking into. Use `on`
instead for a scheduled slot far enough out that the 15 min will lapse, and
`off` right after.

If a forgotten `on` becomes a habit, set `cpu_idle = true` in `cloud_run.tf`.
Nothing depends on unthrottled idle CPU any more — `METRICS_SINK` is `noop`, so
the `QueuedSink` drain task (the only `create_task` in the app) writes into
`NoopSink.write -> return None`, and there is no server-side prewarm. That drops
the cost of a forgotten pin by roughly an order of magnitude.

Everything else is effectively free at demo scale: Hosting's free tier covers the
32 MB of assets, and the 15 container images total 240 MB against a 0.5 GB free
tier.

## Notes

- **The service is publicly invokable.** Firebase Hosting rewrites forward the
  browser's request with no identity token, so `allUsers` has `run.invoker`.
  This matches the design — the endpoint is deliberately credential-free, the
  session id is an opaque per-browser value in the request body, and abuse is
  bounded by `RATE_LIMIT_PER_MIN` and by the single instance.
- **Curated answers still never cross the wire.** Nothing here changes the
  payload contract; `tone`, `triggerSkill` and `minigameId` remain excluded.
