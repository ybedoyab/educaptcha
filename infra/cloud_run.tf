locals {
  # Placeholder for the very first apply, before CI has pushed anything. The
  # real image is set by the deploy workflow and then ignored below.
  image = var.image != "" ? var.image : "us-docker.pkg.dev/cloudrun/container/hello"

  hosting_origins = [
    "https://${var.hosting_site_id}.web.app",
    "https://${var.hosting_site_id}.firebaseapp.com",
  ]

  # The deployed frontend is same-origin via the Hosting rewrite, so CORS is
  # not on its path at all. These cover direct run.app access and local dev.
  cors_allow_origins = join(",", concat(local.hosting_origins, var.extra_cors_origins))
}

resource "google_cloud_run_v2_service" "risk" {
  project  = var.project_id
  name     = var.service_name
  location = var.region

  # Firebase Hosting rewrites reach Cloud Run over the public edge and carry no
  # identity token, so the service must accept external ingress.
  ingress = "INGRESS_TRAFFIC_ALL"

  deletion_protection = false

  template {
    service_account = google_service_account.runtime.email
    timeout         = "60s"

    # THE constraint of this deployment. Session store, analysis cache and rate
    # limiter all live in-process on app.state, so a second *instance* forks the
    # cooldown counter exactly like a second worker would. `max = 1` is what
    # enforces that, and it is not negotiable.
    #
    # `min` is a pure cost/latency dial and defaults to 0: the service sat at a
    # measured 86,400 billable seconds a day — a full 24h — on days with *zero*
    # requests.
    #
    # Scaling to zero never *breaks* anything: the feed prefetches with `dryRun`
    # on mount (frontend/src/lib/risk/riskClient.ts) and a cache miss inside
    # CLICK_TIMEOUT_MS (4.5s) falls back to the local engine. But a cold start
    # measures ~13s, so a first click on a cold service reliably takes that
    # fallback and the agent path is simply not exercised. Do not walk into a
    # demo cold — run `infra/demo.sh warm` first. See infra/README.md.
    scaling {
      min_instance_count = var.min_instances
      max_instance_count = 1
    }

    max_instance_request_concurrency = 80

    containers {
      image = local.image

      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
        # NOTE: this used to be justified by "QueuedSink needs CPU between
        # requests" and "min=1 keeps the cache warm". Neither holds any more.
        # METRICS_SINK is "noop" below, so the QueuedSink drain task (the only
        # create_task in the app) writes into NoopSink.write -> return None; and
        # keeping a cache warm needs the instance *alive*, which is min_instances,
        # not an unthrottled CPU. Left as false only because nothing forces the
        # change now that min defaults to 0 — with no standing instance there is
        # almost nothing left to throttle. Flip to true if the demo switch ever
        # gets left on: it drops the cost of a forgotten `min = 1` by roughly an
        # order of magnitude.
        cpu_idle          = false
        startup_cpu_boost = true
      }

      ports {
        container_port = 8080
      }

      # TCP rather than an HTTP probe on /healthz: the same config has to bring
      # up the placeholder image on the first apply, before any real revision.
      startup_probe {
        tcp_socket {
          port = 8080
        }
        initial_delay_seconds = 5
        period_seconds        = 5
        timeout_seconds       = 3
        failure_threshold     = 12
      }

      # ── server ──
      env {
        name  = "ENV"
        value = "cloudrun"
      }
      env {
        name  = "LOG_LEVEL"
        value = var.log_level
      }
      env {
        name  = "CORS_ALLOW_ORIGINS"
        value = local.cors_allow_origins
      }
      env {
        name  = "RATE_LIMIT_PER_MIN"
        value = tostring(var.rate_limit_per_min)
      }

      # ── model ──
      env {
        name = "GOOGLE_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.google_api_key.secret_id
            version = "latest"
          }
        }
      }
      env {
        name  = "GEMINI_MODEL"
        value = var.gemini_model
      }
      env {
        name  = "GEMINI_THINKING_LEVEL"
        value = var.gemini_thinking_level
      }
      env {
        name  = "GEMINI_TEMPERATURE"
        value = "0"
      }
      env {
        name  = "LLM_TIMEOUT_MS"
        value = tostring(var.llm_timeout_ms)
      }
      env {
        name  = "GRAPH_DEADLINE_MS"
        value = tostring(var.graph_deadline_ms)
      }
      env {
        name  = "ALLOW_NO_LLM"
        value = "false"
      }

      # ── policy ──
      env {
        name  = "RISK_THRESHOLD"
        value = tostring(var.risk_threshold)
      }
      env {
        name  = "COOLDOWN_ACTIONS"
        value = tostring(var.cooldown_actions)
      }
      env {
        name  = "NO_REPEAT_SKILL"
        value = "true"
      }
      env {
        name  = "ORCHESTRATOR_MODE"
        value = "rules"
      }
      env {
        name  = "SHADOW_MODE_ON_SUPPRESSED"
        value = "false"
      }
      env {
        name  = "FEED_ALT_TEXT_TO_VISION"
        value = "false"
      }
      env {
        name  = "REASON_MODE"
        value = "static"
      }

      # ── cache / session ──
      env {
        name  = "CACHE_TTL_SECONDS"
        value = tostring(var.cache_ttl_seconds)
      }
      env {
        name  = "CACHE_MAX_ENTRIES"
        value = "512"
      }
      env {
        name  = "PREWARM_CACHE"
        value = "true"
      }
      env {
        name  = "SESSION_TTL_SECONDS"
        value = tostring(var.session_ttl_seconds)
      }
      env {
        name  = "SESSION_MAX_ENTRIES"
        value = "2000"
      }

      # ── metrics ──
      # Nothing in the repo reads metric events back — there is no dashboard, only
      # the POST /metrics/event writer. So the demo drops the Firestore database
      # entirely and discards events. The endpoint still 202s, so the frontend is
      # unaffected. To turn collection on later: add a google_firestore_database,
      # grant the runtime SA roles/datastore.user, and set this to "firestore"
      # plus GOOGLE_CLOUD_PROJECT.
      env {
        name  = "METRICS_SINK"
        value = "noop"
      }

      # ── tracing ──
      env {
        name  = "LANGSMITH_TRACING"
        value = tostring(var.enable_langsmith)
      }
      env {
        name  = "LANGSMITH_PROJECT"
        value = "educaptcha-risk"
      }

      dynamic "env" {
        for_each = var.enable_langsmith ? [1] : []
        content {
          name = "LANGSMITH_API_KEY"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.langsmith_api_key.secret_id
              version = "latest"
            }
          }
        }
      }
    }
  }

  lifecycle {
    # deploy.sh owns the image tag; Terraform owns everything else about the
    # service. Without this, every `terraform apply` after a deploy would roll
    # the service back to whatever `var.image` happened to be.
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version,
      # Service-level manual scaling, distinct from the template.scaling block
      # above that actually pins this to one instance. The API always returns it
      # populated with zeros; leaving it undeclared makes Terraform try to null
      # it on every plan, producing a perpetual no-op diff.
      scaling,
    ]
  }

  depends_on = [
    google_project_service.enabled,
    google_secret_manager_secret_iam_member.runtime_google_api_key,
  ]
}

# Firebase Hosting rewrites forward the browser's request without minting an ID
# token, so the service has to accept unauthenticated calls. That is the
# documented Hosting↔Run integration, and it matches the design: the endpoint is
# deliberately credential-free (the session id is an opaque per-browser value in
# the body, never an identity). Abuse is bounded by RATE_LIMIT_PER_MIN and by
# max_instance_count = 1.
resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = var.project_id
  location = google_cloud_run_v2_service.risk.location
  name     = google_cloud_run_v2_service.risk.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
