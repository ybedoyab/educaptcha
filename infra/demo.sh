#!/usr/bin/env bash
# Demo warm-up switch for the risk service.
#
#   ./infra/demo.sh status   # what is running, and what it costs
#   ./infra/demo.sh warm     # wake the instance now, no config change (free)
#   ./infra/demo.sh on       # pin one warm instance   (STARTS A STANDING BILL)
#   ./infra/demo.sh off      # back to scale-to-zero   (the resting state)
#
# Why this is a script and not `terraform apply -var min_instances=1`:
# Terraform owns the resting state (min = 0, infra/variables.tf) and that is
# deliberately the *cheap* one, so an apply can only ever cancel a switch left
# on — never turn one on by surprise. This script is the imperative, temporary
# override on top of it. Everything else about the service still belongs to
# Terraform; do not add more knobs here.
#
# `warm` is the one you usually want. `on` is for a scheduled slot where a cold
# start would be visible to a judge.

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-educaptcha}"
REGION="${REGION:-us-central1}"
SERVICE="educaptcha-risk"

# Measured on this service (1 vCPU / 1 GiB, CPU always allocated, us-central1),
# billed for a full 86,400 s/day whether or not a request arrives.
COST_USD_PER_DAY="1.73"
COST_COP_PER_DAY="5,555"

step() { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$*"; }
ok() { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }
die() {
  printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2
  exit 1
}

command -v gcloud >/dev/null || die "gcloud not found"

svc() {
  gcloud run services describe "$SERVICE" \
    --region="$REGION" --project="$PROJECT_ID" "$@"
}

svc >/dev/null 2>&1 ||
  die "Cloud Run service '$SERVICE' not found in $PROJECT_ID/$REGION."

service_url() { svc --format='value(status.url)'; }

# Absent annotation means 0 — Cloud Run drops minScale rather than writing "0".
min_instances() {
  local v
  v="$(svc --format='value(spec.template.metadata.annotations["autoscaling.knative.dev/minScale"])')"
  printf '%s' "${v:-0}"
}

set_min_instances() {
  gcloud run services update "$SERVICE" \
    --min-instances="$1" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --quiet >/dev/null
}

# A request is what actually boots an instance; healthz is the cheapest one that
# touches the app rather than Google's edge (see backend/app/main.py:101).
# Sets PING_CODE / PING_BODY. Returns non-zero on any non-200 so callers can
# just test the exit status, but keeps the code around because 403 and 503 mean
# very different things and misreporting one as the other wastes an afternoon.
PING_CODE=""
PING_BODY=""
ping_service() {
  local out
  # --fail would swallow the body, and the body is the diagnosis.
  out="$(curl --silent --show-error \
    --retry 5 --retry-delay 3 --retry-all-errors \
    --max-time 90 \
    --write-out '\n%{http_code}' \
    "$(service_url)/ops/healthz" 2>/dev/null)" || true

  PING_CODE="${out##*$'\n'}"
  PING_BODY="${out%$'\n'*}"
  [ "$PING_CODE" = "200" ]
}

# Turns a failed ping into an explanation instead of a guess.
explain_ping_failure() {
  case "$PING_CODE" in
    403)
      warn "HTTP 403 — the service is not publicly invokable."
      cat <<'EOF'
  Firebase Hosting rewrites forward the browser's request with no identity
  token, so the frontend needs `allUsers` to hold roles/run.invoker. Without it
  every /risk/** call fails and the SPA silently falls back to its local engine.
  cloud_run.tf declares that binding (google_cloud_run_v2_service_iam_member
  "public"); if it is missing, something removed it out of band.

    gcloud run services get-iam-policy educaptcha-risk --region us-central1

EOF
      ;;
    000 | "")
      warn "no HTTP response — network problem, or the request never reached Google."
      ;;
    5*)
      warn "HTTP $PING_CODE — the container is failing to start or crashing."
      cat <<'EOF'
  ALLOW_NO_LLM=false means validate_startup() refuses to boot without the Gemini
  key. Check that first:

    gcloud run services logs read educaptcha-risk --region us-central1 --limit 50

EOF
      ;;
    *)
      warn "HTTP $PING_CODE"
      if [ -n "$PING_BODY" ]; then
        printf '  %s\n' "$(printf '%s' "$PING_BODY" | head -c 300)"
      fi
      ;;
  esac
  # Explicit: under `set -e` a non-zero fall-through here would exit the script
  # before the caller's own `die`, swallowing the message it was about to print.
  return 0
}

cmd_status() {
  local min url
  min="$(min_instances)"
  url="$(service_url)"

  step "Status"
  printf '  service       %s\n' "$SERVICE"
  printf '  url           %s\n' "$url"
  printf '  min-instances %s\n' "$min"

  if [ "$min" = "0" ]; then
    printf '  standing cost none — you pay only while an instance is up\n'
  else
    printf '  standing cost \033[1;33m~%s COP / ~$%s USD per day, traffic or not\033[0m\n' \
      "$COST_COP_PER_DAY" "$COST_USD_PER_DAY"
  fi

  step "Waking it to check health (this is what a real visitor does)"
  if ping_service; then
    printf '  %s\n' "$PING_BODY"
    case "$PING_BODY" in
      *'"llm":true'*) ok "service healthy, LLM wired" ;;
      *) warn "service responded but llm is not true — check the API key secret" ;;
    esac
  else
    explain_ping_failure
    die "healthz did not return 200"
  fi

  if [ "$min" != "0" ]; then
    printf '\n'
    warn "min-instances is $min. Run './infra/demo.sh off' when the demo is over."
  fi
}

cmd_warm() {
  step "Warming $SERVICE (no config change, no standing cost)"
  # Cold path is container start + Gemini client init, so allow real time here.
  local started elapsed
  started="$(date +%s)"
  if ! ping_service; then
    explain_ping_failure
    die "service did not come up"
  fi
  elapsed=$(($(date +%s) - started))

  ok "warm in ${elapsed}s"
  cat <<'EOF'

  Cloud Run keeps an idle instance for up to ~15 minutes after the last
  request — not a guarantee, but enough to cover a pitch you are walking into
  now. The feed also prefetches every post with `dryRun` on mount, so opening
  /demo warms the analysis cache on top of this.

  Walking into a scheduled slot instead of an imminent one? Use `demo.sh on`.
EOF
}

cmd_on() {
  local min
  min="$(min_instances)"
  if [ "$min" != "0" ]; then
    ok "already pinned at min-instances=$min"
    return
  fi

  step "Pinning one warm instance"
  warn "this starts a standing bill of ~$COST_COP_PER_DAY COP (~\$$COST_USD_PER_DAY USD) per day"
  set_min_instances 1
  # The pin itself succeeded either way — a bad healthz is worth reporting, not
  # worth failing on, since the instance is up and billing regardless.
  if ! ping_service; then
    warn "instance is pinned, but healthz did not return 200:"
    explain_ping_failure
  fi

  ok "warm instance pinned"
  cat <<'EOF'

  Remember to run './infra/demo.sh off' afterwards. Two backstops if you don't:
  a `terraform apply` resets it to the declared min = 0, and `demo.sh status`
  prints the standing cost in yellow.
EOF
}

cmd_off() {
  local min
  min="$(min_instances)"
  if [ "$min" = "0" ]; then
    ok "already at min-instances=0 — nothing to turn off"
    return
  fi

  step "Returning to scale-to-zero"
  set_min_instances 0
  ok "min-instances=0 — the instance drains after ~15 min idle and billing stops"
}

case "${1:-status}" in
  status) cmd_status ;;
  warm) cmd_warm ;;
  on) cmd_on ;;
  off) cmd_off ;;
  *)
    echo "usage: $0 [status|warm|on|off]" >&2
    exit 2
    ;;
esac
