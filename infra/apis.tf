# Only what this deployment actually calls. `disable_on_destroy = false` so a
# `terraform destroy` of the demo does not rip APIs out from under anything else
# in the project, and does not make a re-apply wait on propagation again.

locals {
  services = [
    "artifactregistry.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "firebase.googleapis.com",
    "firebasehosting.googleapis.com",
    "logging.googleapis.com",

    # Terraform itself: serviceusage to enable the rest, iam for the runtime
    # service account, cloudresourcemanager for project-scoped lookups.
    "serviceusage.googleapis.com",
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com",

    # Only matters if the Gemini key belongs to *this* project. An AI Studio key
    # usually belongs to a separate project (you have gen-lang-client-0987079969),
    # in which case enablement and quota apply there and this line is inert.
    # Left in because it costs nothing and its absence is an obscure 403.
    "generativelanguage.googleapis.com",
  ]
}

resource "google_project_service" "enabled" {
  for_each = toset(local.services)

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}
