import {
  Building2,
  Clock,
  EyeOff,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Languages,
  Newspaper,
  Shield,
  SkipForward,
  Users,
  Puzzle,
} from "lucide-react";
import { useI18n } from "../i18n/I18nContext";

export function ImpactSection() {
  const { copy } = useI18n();

  const metrics = [
    { icon: Clock, text: copy.impact.metric1 },
    { icon: Puzzle, text: copy.impact.metric2 },
    { icon: Languages, text: copy.impact.metric3 },
    { icon: SkipForward, text: copy.impact.metric4 },
    { icon: Globe2, text: copy.impact.metric5 },
  ];

  const audiences = [
    { icon: GraduationCap, text: copy.impact.audience1 },
    { icon: Newspaper, text: copy.impact.audience2 },
    { icon: Building2, text: copy.impact.audience3 },
    { icon: HeartHandshake, text: copy.impact.audience4 },
    { icon: Globe2, text: copy.impact.audience5 },
    { icon: Users, text: copy.impact.audience6 },
  ];

  const privacy = [
    copy.impact.privacy1,
    copy.impact.privacy2,
    copy.impact.privacy3,
    copy.impact.privacy4,
    copy.impact.privacy5,
  ];

  const principles = [
    copy.impact.principle1,
    copy.impact.principle2,
    copy.impact.principle3,
    copy.impact.principle4,
    copy.impact.principle5,
    copy.impact.principle6,
  ];

  return (
    <section
      id="impact"
      className="scroll-mt-20 border-b border-navy/8 bg-off-white"
      aria-labelledby="impact-title"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2
          id="impact-title"
          className="font-display text-2xl font-bold text-navy sm:text-3xl"
        >
          {copy.impact.title}
        </h2>
        <p className="mt-2 max-w-2xl text-navy/65">{copy.impact.subtitle}</p>
        <p className="mt-3 inline-flex rounded-full bg-amber/15 px-3 py-1 text-xs font-semibold text-navy/80">
          {copy.impact.projectionsLabel}
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => (
            <li
              key={m.text}
              className="flex items-start gap-3 rounded-2xl border border-navy/8 bg-white p-5 shadow-sm"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky/15 text-teal">
                <m.icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="text-sm font-medium leading-snug text-navy">{m.text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded-2xl border border-teal/25 bg-gradient-to-br from-teal/10 to-sky/10 p-6 sm:p-8">
          <h3 className="font-display text-xl font-bold text-navy">
            {copy.impact.whyTitle}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-navy/75 sm:text-base">
            {copy.impact.whyText}
          </p>
        </div>

        <h3 className="mt-12 font-display text-lg font-bold text-navy">
          {copy.impact.audiencesTitle}
        </h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((a) => (
            <li
              key={a.text}
              className="flex items-center gap-3 rounded-xl border border-navy/8 bg-white px-4 py-3 text-sm font-medium text-navy"
            >
              <a.icon className="h-4 w-4 shrink-0 text-teal" aria-hidden />
              {a.text}
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-navy/8 bg-white p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
              <Shield className="h-5 w-5 text-teal" aria-hidden />
              {copy.impact.privacyTitle}
            </h3>
            <ul className="mt-4 space-y-2">
              {privacy.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-navy/75">
                  <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-sky" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-navy/8 bg-white p-6">
            <h3 className="font-display text-lg font-bold text-navy">
              {copy.impact.principlesTitle}
            </h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-navy/75">
              {principles.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
