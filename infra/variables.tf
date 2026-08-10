variable "project_id" {
  description = "GCP project id hosting every EduCAPTCHA resource."
  type        = string
  default     = "educaptcha"
}

variable "region" {
  description = "Region for Cloud Run and Artifact Registry."
  type        = string
  default     = "us-central1"
}

variable "service_name" {
  description = "Cloud Run service name. Also the Artifact Registry image name."
  type        = string
  default     = "educaptcha-risk"
}

variable "hosting_site_id" {
  description = "Firebase Hosting site id; serves at <id>.web.app."
  type        = string
  default     = "educaptcha"
}

variable "image" {
  description = <<-EOT
    Full image reference for the Cloud Run revision. Leave empty on the first
    apply — the service starts on a placeholder image, and deploy.sh overwrites
    it on every deploy. Terraform ignores subsequent image drift (see cloud_run.tf).
  EOT
  type        = string
  default     = ""
}

# ── application settings ────────────────────────────────────────────────────
# These mirror .env.example. Anything secret lives in Secret Manager instead.

variable "log_level" {
  type    = string
  default = "INFO"
}

variable "rate_limit_per_min" {
  description = "Feed prefetch warms many posts on mount; the 30 default starves warm-up."
  type        = number
  default     = 120
}

variable "gemini_model" {
  type    = string
  default = "gemini-3.5-flash"
}

variable "gemini_thinking_level" {
  type    = string
  default = "minimal"
}

variable "llm_timeout_ms" {
  description = "Socket backstop. Gemini rejects a client deadline under ~10s with a 400."
  type        = number
  default     = 8000
}

variable "graph_deadline_ms" {
  description = "The real budget (asyncio.wait_for). Under ~3s yields graph:deadline fallbacks."
  type        = number
  default     = 9000
}

variable "risk_threshold" {
  type    = number
  default = 0.55
}

variable "cooldown_actions" {
  type    = number
  default = 3
}

variable "cache_ttl_seconds" {
  type    = number
  default = 1800
}

variable "session_ttl_seconds" {
  type    = number
  default = 1800
}

variable "enable_langsmith" {
  description = <<-EOT
    Wire LANGSMITH_API_KEY from Secret Manager into the service. Keep false
    until you have actually added a version to the secret — Cloud Run refuses to
    deploy a revision referencing a secret with no versions.
  EOT
  type        = bool
  default     = false
}

variable "extra_cors_origins" {
  description = <<-EOT
    Origins allowed to call the service *directly* on its run.app URL. The
    deployed frontend is same-origin through the Hosting rewrite and needs none
    of these; this exists for local dev pointed at the deployed backend.
  EOT
  type        = list(string)
  default = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
  ]
}
