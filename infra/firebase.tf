# Firebase Hosting serves the SPA and, via the rewrites in the repo-root
# firebase.json, proxies /risk/** and /metrics/** to Cloud Run. That is what
# makes the deployed frontend same-origin with the risk service: no CORS
# preflight, and no backend URL baked into the bundle at build time.
#
# Terraform owns the site; content is published by `firebase deploy`, because
# Hosting releases are a build artifact, not infrastructure.

resource "google_firebase_project" "default" {
  provider = google-beta
  project  = var.project_id

  depends_on = [google_project_service.enabled]
}

resource "google_firebase_hosting_site" "default" {
  provider = google-beta
  project  = var.project_id
  site_id  = var.hosting_site_id

  depends_on = [google_firebase_project.default]
}
