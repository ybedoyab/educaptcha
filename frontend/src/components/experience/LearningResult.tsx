import {
  ArrowRight,
  BookOpen,
  Home,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { Language } from "../../types";
import type { ExperienceScenario, LearningSession } from "../../types/learning";
import { useI18n } from "../../i18n/I18nContext";
import type { SectionId } from "../../types";

interface LearningResultProps {
  scenario: ExperienceScenario;
  session: LearningSession;
  language: Language;
  onTryAnother: (scenarioId: string) => void;
  onNavigate: (id: SectionId) => void;
}

export function LearningResult({
  scenario,
  session,
  language,
  onTryAnother,
  onNavigate,
}: LearningResultProps) {
  const { copy } = useI18n();
  const initialScore = session.skipped ? 0 : session.initialCorrect ? 1 : 0;
  const transferScore = session.transferCorrect ? 1 : 0;
  const improved =
    session.transferCorrect && (session.skipped || !session.initialCorrect);
  const reinforced = session.transferCorrect && session.initialCorrect;

  const firstResponse = session.skipped
    ? copy.experience.firstSkipped
    : session.initialCorrect
      ? copy.experience.firstIdentified
      : copy.experience.firstMissed;

  const learningText = improved
    ? copy.experience.learningImproved
    : reinforced
      ? copy.experience.learningReinforced
      : copy.experience.learningPartial;

  const otherId =
    scenario.id === "emotional-pressure" ? "image-context" : "emotional-pressure";
  const otherLabel =
    otherId === "image-context"
      ? copy.experience.scenarioImage
      : copy.experience.scenarioEmotional;

  return (
    <div className="animate-slide-up rounded-2xl border border-white/15 bg-white p-5 shadow-xl sm:p-7">
      <div className="flex items-center gap-2 text-teal">
        <Sparkles className="h-5 w-5" aria-hidden />
        <h3 className="font-display text-xl font-bold text-navy">
          {copy.experience.learningResult}
        </h3>
      </div>

      <dl className="mt-6 space-y-4">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-navy/50">
            {copy.experience.skillPracticed}
          </dt>
          <dd className="mt-1 text-base font-semibold text-navy">
            {scenario.skillLabel[language]}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-navy/50">
            {copy.experience.firstResponse}
          </dt>
          <dd className="mt-1 text-sm text-navy/80">{firstResponse}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-navy/50">
            {copy.experience.transferTitle}
          </dt>
          <dd className="mt-1 text-sm text-navy/80">
            {session.transferCorrect
              ? copy.experience.transferSuccess
              : copy.experience.transferMissed}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-navy/50">
            {copy.experience.learningResult}
          </dt>
          <dd className="mt-1 text-sm font-medium text-navy">{learningText}</dd>
        </div>
      </dl>

      <div className="mt-6 rounded-xl border border-navy/10 bg-off-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">
          {copy.experience.beforeAfter}
        </p>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <div>
            <p className="text-xs text-navy/55">{copy.experience.initialRecognition}</p>
            <div className="mt-2 flex items-end gap-1">
              <div
                className="w-full rounded-t-md bg-navy/25"
                style={{ height: `${24 + initialScore * 48}px` }}
                aria-hidden
              />
            </div>
            <p className="mt-1 text-center text-lg font-bold text-navy">{initialScore}</p>
          </div>
          <ArrowRight className="mb-8 h-4 w-4 text-teal" aria-hidden />
          <div>
            <p className="text-xs text-navy/55">{copy.experience.transferRecognition}</p>
            <div className="mt-2 flex items-end gap-1">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-teal to-sky"
                style={{ height: `${24 + transferScore * 48}px` }}
                aria-hidden
              />
            </div>
            <p className="mt-1 text-center text-lg font-bold text-navy">{transferScore}</p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-navy/50">{copy.experience.disclaimer}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onTryAnother(otherId)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          {copy.experience.tryAnother}: {otherLabel}
        </button>
        <button
          type="button"
          onClick={() => onNavigate("demo")}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy"
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          {copy.experience.exploreLibrary}
        </button>
        <button
          type="button"
          onClick={() => onNavigate("impact")}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy"
        >
          {copy.experience.viewImpact}
        </button>
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy"
        >
          <Home className="h-4 w-4" aria-hidden />
          {copy.experience.returnHome}
        </button>
      </div>
    </div>
  );
}
