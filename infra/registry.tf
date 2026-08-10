# Cloud Run can only deploy an image that already lives in a registry, so this
# is not optional — `gcloud run deploy --source` would only make it implicit by
# routing through Cloud Build, which creates its own repo and adds a service.

resource "google_artifact_registry_repository" "images" {
  project       = var.project_id
  location      = var.region
  repository_id = "educaptcha"
  format        = "DOCKER"
  description   = "Container images for the EduCAPTCHA risk service."

  # No cleanup policy: at demo redeploy rates the storage cost is cents, and a
  # KEEP rule does nothing without a matching DELETE rule anyway. Add both
  # together if this ever accumulates.

  depends_on = [google_project_service.enabled]
}
