#!/usr/bin/env bash
# Deploy the risk service to Cloud Run. Run from `backend/`.
#
#   PROJECT=educaptcha-hackathon ./scripts/deploy_cloud_run.sh
#
# Prerequisites the human running this needs, beyond project owner:
#   roles/run.admin, roles/iam.serviceAccountUser (the commonly missing one),
#   roles/artifactregistry.writer, roles/cloudbuild.builds.editor,
#   roles/secretmanager.admin, roles/datastore.owner
set -euo pipefail

PROJECT="${PROJECT:?set PROJECT to your GCP project id}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-educaptcha-risk}"
SA="educaptcha-api@${PROJECT}.iam.gserviceaccount.com"
FRONTEND_ORIGIN="${FRONTEND_ORIGIN:-http://localhost:5173}"

echo "==> enabling APIs"
gcloud services enable --project "$PROJECT" \
  run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com \
  secretmanager.googleapis.com firestore.googleapis.com generativelanguage.googleapis.com

echo "==> Firestore (native mode; skip if it already exists)"
gcloud firestore databases create --project "$PROJECT" \
  --location="${FIRESTORE_LOCATION:-nam5}" --type=firestore-native || true

echo "==> secrets"
# Note: roles/datastore.user is the Firestore role. There is no roles/firestore.*
if ! gcloud secrets describe gemini-api-key --project "$PROJECT" >/dev/null 2>&1; then
  printf '%s' "${GOOGLE_API_KEY:?set GOOGLE_API_KEY}" \
    | gcloud secrets create gemini-api-key --project "$PROJECT" --data-file=-
fi
if [[ -n "${LANGSMITH_API_KEY:-}" ]] \
   && ! gcloud secrets describe langsmith-api-key --project "$PROJECT" >/dev/null 2>&1; then
  printf '%s' "$LANGSMITH_API_KEY" \
    | gcloud secrets create langsmith-api-key --project "$PROJECT" --data-file=-
fi

echo "==> runtime service account (not the default compute SA)"
gcloud iam service-accounts create educaptcha-api --project "$PROJECT" \
  --display-name "EduCAPTCHA risk service" || true
gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:${SA}" --role=roles/datastore.user --condition=None >/dev/null
for secret in gemini-api-key langsmith-api-key; do
  gcloud secrets add-iam-policy-binding "$secret" --project "$PROJECT" \
    --member="serviceAccount:${SA}" --role=roles/secretmanager.secretAccessor >/dev/null 2>&1 || true
done

echo "==> deploy"
# --allow-unauthenticated grants run.invoker to allUsers, which the
# constraints/iam.allowedPolicyMemberDomains org policy blocks on many projects.
# Test that the day BEFORE the demo, not the day of.
gcloud run deploy "$SERVICE" \
  --project "$PROJECT" --region "$REGION" --source . \
  --service-account "$SA" \
  --allow-unauthenticated \
  --min-instances 1 --max-instances 3 \
  --cpu 1 --memory 512Mi --concurrency 8 --timeout 30s --cpu-boost \
  --set-env-vars "ENV=cloudrun,GEMINI_MODEL=gemini-3.5-flash,GEMINI_THINKING_LEVEL=minimal,METRICS_SINK=firestore,GOOGLE_CLOUD_PROJECT=${PROJECT},LANGSMITH_TRACING=true,LANGSMITH_PROJECT=educaptcha-risk,CORS_ALLOW_ORIGINS=${FRONTEND_ORIGIN}" \
  --set-secrets "GOOGLE_API_KEY=gemini-api-key:latest,LANGSMITH_API_KEY=langsmith-api-key:latest"

URL="$(gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format='value(status.url)')"
echo
echo "deployed: $URL"
echo "point the frontend at it:  VITE_RISK_API_URL=$URL npm run build"
