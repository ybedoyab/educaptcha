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

No backend, authentication, external APIs, or environment variables.

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

The current frontend demo uses **simulated/local trigger logic** (`LearningTriggerEngine`). Automated risk analysis is outside this frontend prototype.

The UI can later accept an external decision shaped like:

```ts
type RiskDecision = {
  shouldIntervene: boolean;
  skill?: string;
  riskReason?: string;
  challengeId?: string;
};
```

No agents, cloud services, or model inference are implemented in this repository.

## Project structure

```text
src/
  components/     Landing, OpenFeed, practice minigames, dashboard
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
- **Practice mode** — curated visual minigames with skip, feedback, and session summary
- **Integration simulator** — comment flow + proposed npm / script snippets
- **Dashboard** — simulated org metrics and live learning-transfer readout from OpenFeed sessions
- **i18n** — English and Español
- **Accessibility** — keyboard use, dialog focus, skippable challenges, `prefers-reduced-motion`
- **Responsive** — mobile-first OpenFeed and practice layouts

## Prototype limitations

- No real npm package or CDN widget exists yet (snippets are proposals)
- Analytics are anonymous **demo data**
- Challenges are a small curated set for presentation
- No server-side scoring, moderation, or multi-tenant org accounts
- Does not claim to detect misinformation or AI content automatically
- Risk triggers are local/demo only — not a production classifier

## Next steps (outside this frontend freeze)

- Embeddable SDK
- External risk-analysis service integration
- Challenge authoring for educators
- Pedagogical review workflows
- Additional languages and classroom pilots

## Brand

Palette: Deep Navy `#0F172A`, Teal Blue `#0EA5A4`, Bright Sky `#38BDF8`, Warm Amber `#F59E0B`, Soft Off-White `#F8FAFC`.

Primary logo in the app is an inline SVG (shield + CAPTCHA grid + check + learning spark). PNG assets in `assets/` are kept for brand reference.

## License

Prototype for hackathon demonstration purposes.
