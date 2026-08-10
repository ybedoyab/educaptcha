# Remote state bucket. Created by the first (local-state) apply; you then
# uncomment the `backend "gcs"` block in versions.tf and run
# `terraform init -migrate-state`. Versioning is on so a bad apply is recoverable.

resource "google_storage_bucket" "tfstate" {
  name          = "${var.project_id}-tfstate"
  project       = var.project_id
  location      = "US"
  force_destroy = false

  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      num_newer_versions = 20
    }
    action {
      type = "Delete"
    }
  }

  depends_on = [google_project_service.enabled]
}
