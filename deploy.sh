#!/usr/bin/env bash
# Deploy EduCAPTCHA: backend image → Cloud Run, frontend build → Firebase Hosting.
#
#   ./deploy.sh              # both
#   ./deploy.sh backend      # image + Cloud Run only
#   ./deploy.sh frontend     # SPA only
#
# Uses your own gcloud credentials — no CI identity, no service account key.
# Infrastructure is Terraform's (infra/); this script only swaps the image tag
# and publishes a Hosting release.

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-educaptcha}"
REGION="${REGION:-us-central1}"
SERVICE="educaptcha-risk"
REPOSITORY="educaptcha"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

TARGET="${1:-all}"
case "$TARGET" in
  all | backend | frontend) ;;
  *)
    echo "usage: $0 [all|backend|frontend]" >&2
    exit 2
    ;;
esac

step() { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
die() {
  printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2
  exit 1
}

command -v gcloud >/dev/null || die "gcloud not found"
command -v docker >/dev/null || die "docker not found"

# A dirty tree means the tag would not describe what is inside the image.
if [ -n "$(git status --porcelain)" ]; then
  printf '\033[1;33m! working tree is dirty; tagging anyway\033[0m\n'
fi
SHA="$(git rev-parse --short HEAD)"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE}:${SHA}"

deploy_backend() {
  # `gcloud run deploy` happily CREATES a service that does not exist — with no
  # env, no secret and the default compute SA — which then crashes on startup
  # because GOOGLE_API_KEY is unset. Terraform owns service creation; this
  # script only ever swaps the image on an existing one.
  if ! gcloud run services describe "$SERVICE" \
    --region="$REGION" --project="$PROJECT_ID" >/dev/null 2>&1; then
    die "Cloud Run service '$SERVICE' does not exist yet. Run the Terraform in infra/ first (see infra/README.md)."
  fi

  step "Authenticating Docker to Artifact Registry"
  gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

  step "Building $IMAGE"
  # Build context is the repo root: the Dockerfile pulls in both workspace
  # packages plus uv.lock. --platform matters when building from arm64.
  docker build --platform linux/amd64 -f backend/Dockerfile -t "$IMAGE" .

  step "Pushing image"
  docker push "$IMAGE"

  step "Deploying to Cloud Run"
  # Only the image. Env, secrets, scaling and identity belong to Terraform —
  # setting them here would be silently reverted by the next apply.
  gcloud run deploy "$SERVICE" \
    --image="$IMAGE" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --quiet

  step "Smoke testing"
  local url
  url="$(gcloud run services describe "$SERVICE" \
    --region="$REGION" --project="$PROJECT_ID" --format='value(status.url)')"
  # llm:false would mean the API key secret never reached the container.
  if curl --fail --silent --show-error --retry 5 --retry-delay 3 --retry-all-errors \
    "$url/ops/healthz" | tee /dev/stderr | grep -q '"llm":true'; then
    printf '\n\033[1;32m✓ backend live: %s\033[0m\n' "$url"
  else
    die "healthz did not report llm:true — check the educaptcha-google-api-key secret"
  fi
}

deploy_frontend() {
  step "Building frontend"
  # Relative base: the SPA and the risk service share the Hosting origin, so
  # requests go to /risk/analyze on the same domain and the rewrite in
  # firebase.json forwards them to Cloud Run. No CORS, and no Cloud Run URL
  # baked into the public bundle.
  #
  # The two MSYS_* vars are load-bearing on Git Bash for Windows: it rewrites
  # POSIX-looking values when spawning native processes, so a bare "/" reaches
  # npm as "C:/Program Files/Git/" and gets inlined into the bundle by Vite. The
  # app then fetches file:///C:/Program%20Files/Git/risk/analyze. Both vars are
  # inert on Linux and macOS.
  (cd frontend && npm ci && \
    MSYS_NO_PATHCONV=1 MSYS2_ENV_CONV_EXCL="VITE_RISK_API_URL" \
    VITE_RISK_API_URL="/" npm run build)

  # This exact bug shipped once and was invisible until runtime, so verify the
  # artifact rather than trusting the build.
  if grep -rq "Program Files" frontend/dist/assets/*.js; then
    die "build inlined a Windows path into the bundle — VITE_RISK_API_URL was mangled by the shell"
  fi

  step "Publishing to Firebase Hosting"
  npx --yes firebase-tools@14 deploy \
    --only hosting \
    --project "$PROJECT_ID" \
    --non-interactive \
    --message "$SHA"

  printf '\n\033[1;32m✓ frontend live: https://%s.web.app\033[0m\n' "$PROJECT_ID"
}

if [ "$TARGET" = "all" ] || [ "$TARGET" = "backend" ]; then
  deploy_backend
fi

if [ "$TARGET" = "all" ] || [ "$TARGET" = "frontend" ]; then
  deploy_frontend
fi
