# EduCAPTCHA

Educational microlearning inspired by CAPTCHA interactions — built as a demo for the **UNESCO Youth Hackathon 2026**.

**Verify. Think. Learn.**

EduCAPTCHA turns brief digital actions into 15-second lessons that help people recognize clickbait, weak sources, reused imagery, emotional manipulation, misleading statistics, and claims about AI-generated content.

> This is an **educational layer**, not a production bot-defense system. It can sit alongside invisible security mechanisms and never permanently blocks users from completing an action.

## Goal

Demonstrate, in under three minutes, how everyday verification moments can teach media literacy — and how the same widget could embed into websites people already use.

## Tech stack

- React 19
- Vite
- TypeScript
- Tailwind CSS v4
- Lucide React (icons)
- Local simulated data
- LocalStorage for language and demo progress

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

## Project structure

```text
src/
  components/     UI sections and challenge widget pieces
  data/           Challenges and analytics demo datasets
  hooks/          LocalStorage and demo progress
  i18n/           EN / ES translations and context
  types/          Shared TypeScript types
  App.tsx         Single-page shell and section navigation
assets/           Brand PNG lockups (optional; logo is SVG in-app)
public/           Favicon
```

## Features

- **Home** — hero, simulated browser widget, three-step flow, traditional CAPTCHA vs EduCAPTCHA comparison
- **Real-world experience** — immersive OpenFeed simulation with contextual EduCAPTCHA, transfer challenge, and learning-result summary (primary pitch demo)
- **Practice mode** — six challenges across literacy categories with check, skip, feedback, takeaways, and session summary
- **Integration simulator** — fake news comment flow that opens an EduCAPTCHA modal, plus proposed npm / script snippets with copy-to-clipboard
- **Impact** — projected metrics, audiences, privacy principles, and product positioning
- **Results panel** — organization dashboard with period filters, CSS/SVG charts (simulated data), plus live **learning transfer** from the real-world session
- **i18n** — English and Español for UI and challenges
- **Accessibility** — keyboard use, focus styles, ARIA, skippable challenges, `prefers-reduced-motion`
- **Responsive** — mobile menu, single-column layouts, near-fullscreen modal on small screens

## Prototype limitations

- No real npm package or CDN widget exists yet (snippets are proposals)
- Analytics are anonymous **demo data**
- Challenges are a small curated set for presentation
- No server-side scoring, moderation, or multi-tenant org accounts
- Does not claim to detect misinformation or AI content automatically

## Next steps

- Ship a real embeddable SDK
- Challenge authoring panel for educators
- Pedagogical review and moderation workflows
- Additional languages
- Classroom / student pilots
- Integrations with live websites
- Anonymous aggregate metrics
- Cultural adaptation of challenge content

## Brand

Palette: Deep Navy `#0F172A`, Teal Blue `#0EA5A4`, Bright Sky `#38BDF8`, Warm Amber `#F59E0B`, Soft Off-White `#F8FAFC`.

Primary logo in the app is an inline SVG (shield + CAPTCHA grid + check + learning spark). PNG assets in `assets/` are kept for brand reference.

## License

Prototype for hackathon demonstration purposes.
