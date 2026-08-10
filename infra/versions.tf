terraform {
  required_version = ">= 1.9"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.20"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 6.20"
    }
  }

  # State lives in the bucket created by `state.tf`. That is a bootstrap cycle:
  # the first `terraform apply` runs with local state, then you migrate.
  # See infra/README.md — uncomment and run `terraform init -migrate-state`.
  #
  # backend "gcs" {
  #   bucket = "educaptcha-tfstate"
  #   prefix = "educaptcha"
  # }
}

# Firebase (and other user-project-scoped APIs) bill each call to a "quota
# project" sent as x-goog-user-project. Left unset, the provider inherits
# whatever `gcloud auth application-default` happens to have configured — which
# can be a stale or even deleted project, and surfaces as an opaque
# "Error 403: The caller does not have permission" that looks like an IAM
# problem on *this* project. Pinning it makes the config independent of local
# gcloud state.

provider "google" {
  project               = var.project_id
  region                = var.region
  billing_project       = var.project_id
  user_project_override = true
}

provider "google-beta" {
  project               = var.project_id
  region                = var.region
  billing_project       = var.project_id
  user_project_override = true
}
