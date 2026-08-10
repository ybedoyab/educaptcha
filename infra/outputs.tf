output "service_url" {
  description = "Direct Cloud Run URL. Useful for smoke tests; the demo uses the Hosting origin."
  value       = google_cloud_run_v2_service.risk.uri
}

output "hosting_url" {
  description = "Where the demo lives."
  value       = "https://${google_firebase_hosting_site.default.site_id}.web.app"
}

output "image_repository" {
  description = "Push target; deploy.sh appends /<service>:<sha>."
  value = join("/", [
    "${var.region}-docker.pkg.dev",
    var.project_id,
    google_artifact_registry_repository.images.repository_id,
  ])
}

output "runtime_service_account" {
  value = google_service_account.runtime.email
}
