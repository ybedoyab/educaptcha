import type { ReactNode } from "react";
import type { Challenge, ChallengeVisual, Language } from "../types";
import { useI18n } from "../i18n/I18nContext";
import { AlertTriangle, Clock, Share2, Siren } from "lucide-react";

interface ChallengeVisualsProps {
  visual: ChallengeVisual;
  language: Language;
}

export function ChallengeVisuals({ visual, language }: ChallengeVisualsProps) {
  const { copy } = useI18n();
  if (visual === "none") return null;

  if (visual === "social-posts") {
    return (
      <div
        className="mb-4 grid gap-3 sm:grid-cols-2"
        aria-label={copy.visuals.postACaption}
      >
        <figure className="overflow-hidden rounded-xl border border-navy/10 bg-white">
          <div
            className="h-28 bg-gradient-to-br from-sky via-teal/60 to-navy"
            role="img"
            aria-label={copy.visuals.postACaption}
          />
          <figcaption className="px-3 py-2 text-xs text-navy/65">
            {copy.visuals.postACaption}
          </figcaption>
        </figure>
        <figure className="overflow-hidden rounded-xl border border-navy/10 bg-white">
          <div
            className="h-28 bg-gradient-to-br from-sky via-teal/60 to-navy opacity-90"
            role="img"
            aria-label={copy.visuals.postBCaption}
          />
          <figcaption className="px-3 py-2 text-xs text-navy/65">
            {copy.visuals.postBCaption}
          </figcaption>
        </figure>
      </div>
    );
  }

  if (visual === "ai-grid") {
    const tiles = [
      "from-navy/80 to-sky/50",
      "from-teal/70 to-amber/40",
      "from-sky/60 to-navy/40",
      "from-amber/50 to-teal/60",
    ];
    return (
      <div
        className="mb-4 grid grid-cols-2 gap-2"
        role="img"
        aria-label={copy.visuals.aiGridLabel}
      >
        {tiles.map((g, i) => (
          <div
            key={g}
            className={`aspect-square rounded-xl bg-gradient-to-br ${g}`}
            aria-hidden
          >
            <div className="flex h-full items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-white/25 blur-[1px]" />
            </div>
            <span className="sr-only">
              {language === "es" ? `Escena ${i + 1}` : `Scene ${i + 1}`}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (visual === "emotion-cards") {
    const items = [
      { icon: Clock, label: copy.visuals.emotionUrgency },
      { icon: Siren, label: copy.visuals.emotionFear },
      { icon: AlertTriangle, label: copy.visuals.emotionAbsolute },
      { icon: Share2, label: copy.visuals.emotionShare },
    ];
    return (
      <ul className="mb-4 grid grid-cols-2 gap-2">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-2 rounded-xl border border-amber/30 bg-amber/5 px-3 py-2.5 text-xs font-medium text-navy"
          >
            <item.icon className="h-4 w-4 shrink-0 text-amber" aria-hidden />
            {item.label}
          </li>
        ))}
      </ul>
    );
  }

  if (visual === "truncated-chart") {
    return (
      <div
        className="mb-4 rounded-xl border border-navy/10 bg-white p-4"
        role="img"
        aria-label={copy.visuals.chartTitle}
      >
        <p className="mb-3 text-xs font-semibold text-navy/60">
          {copy.visuals.chartTitle}
        </p>
        <svg viewBox="0 0 280 140" className="w-full" aria-hidden>
          <line x1="40" y1="10" x2="40" y2="110" stroke="#0F172A" strokeOpacity="0.2" />
          <line x1="40" y1="110" x2="260" y2="110" stroke="#0F172A" strokeOpacity="0.2" />
          <text x="8" y="30" fontSize="10" fill="#0F172A" fillOpacity="0.5">
            92
          </text>
          <text x="8" y="70" fontSize="10" fill="#0F172A" fillOpacity="0.5">
            88
          </text>
          <text x="8" y="110" fontSize="10" fill="#0F172A" fillOpacity="0.5">
            84
          </text>
          <rect x="80" y="55" width="48" height="55" rx="4" fill="#38BDF8" />
          <rect x="170" y="20" width="48" height="90" rx="4" fill="#0EA5A4" />
          <text x="88" y="128" fontSize="11" fill="#0F172A" fillOpacity="0.7">
            {copy.visuals.chartA}
          </text>
          <text x="178" y="128" fontSize="11" fill="#0F172A" fillOpacity="0.7">
            {copy.visuals.chartB}
          </text>
        </svg>
      </div>
    );
  }

  return null;
}

interface ChallengeCardProps {
  challenge: Challenge;
  children: ReactNode;
}

export function ChallengeCard({ challenge, children }: ChallengeCardProps) {
  const { language, copy } = useI18n();
  const categoryLabel =
    copy.categories[challenge.category as keyof typeof copy.categories];

  return (
    <article className="animate-fade-in rounded-2xl border border-navy/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-teal/10 px-2.5 py-1 text-xs font-semibold text-teal">
          {copy.demo.typeLabel}: {categoryLabel}
        </span>
      </div>
      <ChallengeVisuals visual={challenge.visual ?? "none"} language={language} />
      <h3 className="text-base font-semibold leading-snug text-navy sm:text-lg">
        {(challenge.question ?? challenge.title)[language]}
      </h3>
      <div className="mt-4">{children}</div>
    </article>
  );
}
