import { HelpCircle, Lightbulb, MousePointerClick } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";

export function HowItWorks() {
  const { copy } = useI18n();
  const steps = [
    {
      icon: HelpCircle,
      title: copy.howItWorks.step1Title,
      text: copy.howItWorks.step1Text,
    },
    {
      icon: MousePointerClick,
      title: copy.howItWorks.step2Title,
      text: copy.howItWorks.step2Text,
    },
    {
      icon: Lightbulb,
      title: copy.howItWorks.step3Title,
      text: copy.howItWorks.step3Text,
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="how-title">
      <div className="max-w-2xl">
        <h2 id="how-title" className="font-display text-2xl font-bold text-navy sm:text-3xl">
          {copy.howItWorks.title}
        </h2>
        <p className="mt-2 text-navy/65">{copy.howItWorks.subtitle}</p>
      </div>
      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="relative rounded-2xl border border-navy/8 bg-white p-6 shadow-sm"
          >
            <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky/15 text-teal">
              <step.icon className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal">
              {i + 1}
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold text-navy">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-navy/65">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
