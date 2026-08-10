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

## Cost

`min_instance_count = 1` is the one line with a standing bill: roughly $12–18 a
month for an always-warm 1 vCPU / 1 GiB instance with CPU always allocated. That
buys away both the container cold start and the 2–6s cold analysis, which is the
difference between a demo that feels instant and one that doesn't. Set it to 0
between demos if that matters; the first click afterwards will be slow.

Everything else is effectively free at demo scale: Hosting's free tier covers the
32 MB of assets, and a handful of container images cost cents.

## Notes

- **The service is publicly invokable.** Firebase Hosting rewrites forward the
  browser's request with no identity token, so `allUsers` has `run.invoker`.
  This matches the design — the endpoint is deliberately credential-free, the
  session id is an opaque per-browser value in the request body, and abuse is
  bounded by `RATE_LIMIT_PER_MIN` and by the single instance.
- **Curated answers still never cross the wire.** Nothing here changes the
  payload contract; `tone`, `triggerSkill` and `minigameId` remain excluded.
