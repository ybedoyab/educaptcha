/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Origin of the external risk-analysis service, e.g. `http://127.0.0.1:8080`.
   * Unset (the default, and in CI) means every decision is made locally by
   * `LearningTriggerEngine` and the app makes no network calls at all.
   *
   * Inlined into the bundle at build time — public, never a secret, and a
   * change requires a rebuild.
   */
  readonly VITE_RISK_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
