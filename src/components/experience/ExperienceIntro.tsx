import { useI18n } from "../../i18n/I18nContext";

interface ExperienceIntroProps {
  onStart: () => void;
}

export function ExperienceIntro({ onStart }: ExperienceIntroProps) {
  const { copy } = useI18n();

  return (
    <div
      className="animate-slide-up mx-auto max-w-md rounded-2xl border border-white/15 bg-white/95 p-6 text-center shadow-xl backdrop-blur"
      role="dialog"
      aria-labelledby="experience-intro-title"
    >
      <p id="experience-intro-title" className="text-sm leading-relaxed text-navy/80">
        {copy.experience.introText}
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal/90"
      >
        {copy.experience.startBrowsing}
      </button>
    </div>
  );
}
