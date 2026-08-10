# Terraform owns the secret *containers* and the IAM on them — never the
# values. Add versions out of band so no key ever lands in state or in git:
#
#   printf '%s' "$GOOGLE_API_KEY" | \
#     gcloud secrets versions add educaptcha-google-api-key --data-file=- \
#       --project=educaptcha
#
# The service reads them as env vars, so backend/app/settings.py needs no
# change: pydantic-settings sees GOOGLE_API_KEY exactly as it does locally.

resource "google_secret_manager_secret" "google_api_key" {
  project   = var.project_id
  secret_id = "educaptcha-google-api-key"

  replication {
    auto {}
  }

  depends_on = [google_project_service.enabled]
}

resource "google_secret_manager_secret" "langsmith_api_key" {
  project   = var.project_id
  secret_id = "educaptcha-langsmith-api-key"

  replication {
    auto {}
  }

  depends_on = [google_project_service.enabled]
}

resource "google_secret_manager_secret_iam_member" "runtime_google_api_key" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.google_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_secret_manager_secret_iam_member" "runtime_langsmith_api_key" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.langsmith_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.runtime.email}"
}
