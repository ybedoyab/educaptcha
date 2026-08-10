# Runtime identity for the Cloud Run service. Deliberately *not* the default
# compute service account, which carries project Editor.
#
# It holds exactly one permission, granted in secrets.tf: read the Gemini API
# key. Container stdout is collected by the Cloud Run infrastructure rather than
# by the app's identity, so no logWriter role is needed — the app logs through
# stdlib `logging`, not a Cloud Logging client.

resource "google_service_account" "runtime" {
  project      = var.project_id
  account_id   = "educaptcha-risk-run"
  display_name = "EduCAPTCHA risk service (Cloud Run runtime)"

  depends_on = [google_project_service.enabled]
}
