# EduCAPTCHA

Educational microlearning inspired by CAPTCHA interactions — built as a demo for the **UNESCO Youth Hackathon 2026**.

**Verify. Think. Learn.**

EduCAPTCHA introduces short verification pauses before potentially risky digital actions, helping users check sources, context and manipulation before they share.

> This is an **educational layer**, not a production bot-defense system. It can sit alongside invisible security mechanisms and never permanently blocks users from completing an action.

## Goal

Demonstrate, in under three minutes, how everyday verification moments can teach media literacy — and how the same widget could embed into websites people already use.

## Tech stack

- React 19
- Vite
- TypeScript
- Tailwind CSS v4
- Lucide React (icons)
- React Router
- Local simulated data
- LocalStorage for language and demo progress
- Vitest + Playwright

No authentication. The frontend runs entirely offline by default; a single
optional environment variable (`VITE_RISK_API_URL`) points it at the external
risk-analysis service in `backend/`. Unset — the default, and what CI builds —
every decision is made locally and the app makes no network calls at all.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Tests:

```bash
npm run test
npm run test:e2e
npm run test:all
```

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing |
| `/demo` | OpenFeed immersive social simulation |
| `/demo/scenario/:id` | Guided OpenFeed scenario (e.g. `image-context`) |
| `/demo/bookface` | Bookface — the same simulation in a Facebook-style layout |
| `/demo/bookface/scenario/:id` | Guided Bookface scenario |
| `/practice` | Practice mode minigames |
| `/integration` | Integration simulator + proposed embed snippets |
| `/dashboard` | Organization dashboard demo (simulated metrics) |

## Core interaction

**Spot → Check → Decide**

1. **Spot** — notice a claim or image before sharing  
2. **Check** — inspect a short **SourceTrace** (claim → social post → source → archive → original)  
3. **Decide** — choose what the evidence means, then return to the feed decision  

Practice mode may also include drag-classify, chart repair, and image inspection. Click/tap is the canonical classify path; drag is progressive enhancement.

## Risk detection

Two interchangeable sources decide whether an action is interrupted.

**Local (default).** `src/lib/LearningTriggerEngine.ts` — a deterministic
heuristic over the curated demo posts. No network, no key, no configuration.

**External agents (opt-in).** `backend/` is a FastAPI + LangGraph service that
analyses the post content with Gemini and returns a decision. Specialist agents
run in parallel — text (emotional pressure, sourcing), image (context, origin,
AI artefacts) and chart (axis truncation, scale distortion) — and a rule-based
orchestrator combines their weighted signals into a `riskScore`, applies the
policy gates, and only then resolves a challenge.

It is deliberately **not** a truth classifier: it detects patterns worth pausing
on, never whether a claim is true.

Enable it by pointing the frontend at the service:

```bash
VITE_RISK_API_URL=http://127.0.0.1:8080 npm run dev
```

The local engine is still evaluated on every action and is used as the fallback
whenever the service is slow, unreachable, or returns something that fails
validation — so enabling it can degrade to today's behaviour but never break it.
Guided `/demo/scenario/:id` runs and transfer challenges stay local by design.

Response shape (`src/types/sourceTrace.ts`):

```ts
type RiskDecision = {
  shouldIntervene: boolean;
  outcome?: "continue" | "intercept" | "verify-ack";
  skill?: string;
  challengeId?: string;
  transferChallengeId?: string;
  transferPostId?: string;
  reason?: LocalizedText;   // bilingual — the dialog renders reason[language]
};
```

See `backend/README.md` for the pipeline, latency characteristics and deployment.

## Project structure

```text
src/
  components/     Landing, OpenFeed (Y skin), Bookface skin, minigames, dashboard
  context/        Demo session + flow state
  data/           Posts, challenges, media assets, source traces
  hooks/          LocalStorage and demo progress
  i18n/           EN / ES translations
  lib/            Demo flow reducer, local trigger engine
  pages/          Route-level screens
  types/          Shared TypeScript types
  tests/          Unit tests
e2e/              Playwright end-to-end tests
public/           Favicon and local demo assets
assets/           Brand PNG lockups (optional; logo is SVG in-app)
```

## Features

- **Landing** — product pitch, short browser mock, how-it-works
- **OpenFeed** — full-screen social feed with EduCAPTCHA interruptions, SourceTrace, intent return, and skill transfer
- **Bookface** — a second skin over the same feed data and the same intercept pipeline, styled after a Facebook-style layout, showing the learning layer is host-agnostic
- **Practice mode** — curated visual minigames with skip, feedback, and session summary
- **Integration simulator** — comment flow + proposed npm / script snippets
- **Dashboard** — simulated org metrics and live learning-transfer readout from OpenFeed sessions
- **i18n** — English and Español
- **Accessibility** — keyboard use, dialog focus, skippable challenges, `prefers-reduced-motion`
- **Responsive** — mobile-first feed and practice layouts

## Prototype limitations

- No real npm package or CDN widget exists yet (snippets are proposals)
- Analytics are anonymous **demo data**
- Challenges are a small curated set for presentation
- No moderation or multi-tenant org accounts
- Does not claim to detect misinformation or AI content automatically
- The risk service is a working prototype tuned against 18 curated posts, not a
  production classifier
- Comment text is sent to the service when it is configured (never stored: the
  metrics schema has no free-text field)

## Next steps (outside this frontend freeze)

- Embeddable SDK
- Cloud Run deployment of the risk service (scripted, not yet deployed)
- Minigames for the two skills the agents can detect but cannot yet teach
  (`ai-content`, `sources`)
- Challenge authoring for educators
- Pedagogical review workflows
- Additional languages and classroom pilots

## Brand

Palette: Deep Navy `#0F172A`, Teal Blue `#0EA5A4`, Bright Sky `#38BDF8`, Warm Amber `#F59E0B`, Soft Off-White `#F8FAFC`.

Primary logo in the app is an inline SVG (shield + CAPTCHA grid + check + learning spark). PNG assets in `assets/` are kept for brand reference.

## License

Prototype for hackathon demonstration purposes.
