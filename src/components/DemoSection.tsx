import { useEffect, useState } from "react";
import { Award, Compass, RefreshCw, SkipForward } from "lucide-react";
import { challenges } from "../data/challenges";
import { useDemoProgress } from "../hooks/useDemoProgress";
import { useI18n } from "../i18n/I18nContext";
import type { SectionId } from "../types";
import { ChallengeCard } from "./ChallengeCard";
import { ChallengeOption } from "./ChallengeOption";
import { FeedbackPanel } from "./FeedbackPanel";
import { Logo } from "./Logo";
import { ProgressIndicator } from "./ProgressIndicator";

interface DemoSectionProps {
  onNavigate: (id: SectionId) => void;
  progressApi: ReturnType<typeof useDemoProgress>;
}

export function DemoSection({ onNavigate, progressApi }: DemoSectionProps) {
  const { language, copy } = useI18n();
  const {
    progress,
    currentIndex,
    current,
    total,
    markAnswer,
    markSkip,
    goNext,
    reset,
    skillLabels,
    finish,
    skills,
  } = progressApi;

  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setSelected(null);
    setRevealed(false);
  }, [currentIndex, progress.finished]);

  const handleCheck = () => {
    if (!selected || !current) return;
    const correct = selected === current.correctOptionId;
    markAnswer(current.id, correct);
    setRevealed(true);
  };

  const handleSkip = () => {
    if (!current) return;
    markSkip(current.id);
    if (currentIndex >= total - 1) {
      finish();
    } else {
      goNext();
    }
  };

  const handleContinue = () => {
    if (currentIndex >= total - 1) {
      finish();
    } else {
      goNext();
    }
  };

  const completedCount = progress.completedIds.length;

  return (
    <section
      id="demo"
      className="scroll-mt-20 border-b border-navy/8 bg-gradient-to-b from-off-white to-sky/10"
      aria-labelledby="demo-title"
    >
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2
          id="demo-title"
          className="font-display text-2xl font-bold text-navy sm:text-3xl"
        >
          {copy.demo.title}
        </h2>
        <p className="mt-2 text-navy/65">{copy.demo.subtitle}</p>

        <div className="mt-6 rounded-2xl border border-teal/30 bg-gradient-to-br from-teal/10 to-sky/10 p-5 sm:p-6">
          <h3 className="font-display text-lg font-bold text-navy">
            {copy.demo.contextCardTitle}
          </h3>
          <p className="mt-2 text-sm text-navy/75">{copy.demo.contextCardText}</p>
          <button
            type="button"
            onClick={() => onNavigate("experience")}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Compass className="h-4 w-4" aria-hidden />
            {copy.demo.contextCardCta}
          </button>
        </div>

        <div className="mt-8">
          <ProgressIndicator
            current={Math.min(completedCount, total)}
            total={total}
            label={copy.demo.progress}
            ofLabel={copy.demo.of}
          />
        </div>

        {progress.finished ? (
          <div className="mt-6 animate-slide-up rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/15 text-teal">
                <Award className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="font-display text-xl font-bold text-navy">
                {copy.demo.summaryTitle}
              </h3>
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-off-white p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy/50">
                  {copy.demo.totalScore}
                </dt>
                <dd className="mt-1 text-2xl font-bold text-navy">
                  {progress.score}/{total}
                </dd>
              </div>
              <div className="rounded-xl bg-off-white p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy/50">
                  {copy.demo.categoriesCompleted}
                </dt>
                <dd className="mt-1 text-2xl font-bold text-navy">
                  {skills.length}
                </dd>
              </div>
              <div className="rounded-xl bg-off-white p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy/50">
                  {copy.demo.skipped}
                </dt>
                <dd className="mt-1 text-2xl font-bold text-navy">
                  {progress.skippedIds.length}
                </dd>
              </div>
            </dl>
            <div className="mt-6">
              <p className="text-sm font-semibold text-navy">
                {copy.demo.skillsReinforced}
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {skillLabels(language).map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full bg-sky/15 px-3 py-1 text-xs font-medium text-navy"
                  >
                    {skill}
                  </li>
                ))}
                {skillLabels(language).length === 0 && (
                  <li className="text-sm text-navy/50">—</li>
                )}
              </ul>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-white"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                {copy.demo.retry}
              </button>
              <button
                type="button"
                onClick={() => onNavigate("impact")}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-navy/15 bg-white px-5 py-2.5 text-sm font-semibold text-navy"
              >
                {copy.demo.viewImpact}
              </button>
            </div>
          </div>
        ) : (
          current && (
            <div className="mt-6">
              <div className="mb-3">
                <Logo size="sm" />
              </div>
              <ChallengeCard challenge={current}>
                <div
                  role="radiogroup"
                  aria-label={current.question[language]}
                  className="space-y-2"
                >
                  {current.options.map((opt, i) => (
                    <ChallengeOption
                      key={opt.id}
                      id={opt.id}
                      label={opt.label[language]}
                      selected={selected === opt.id}
                      revealed={revealed}
                      isCorrect={opt.id === current.correctOptionId}
                      disabled={revealed}
                      onSelect={setSelected}
                      index={i}
                    />
                  ))}
                </div>

                {!revealed && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleCheck}
                      disabled={!selected}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                    >
                      {copy.demo.check}
                    </button>
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-medium text-navy/70 transition hover:bg-navy/5"
                    >
                      <SkipForward className="h-4 w-4" aria-hidden />
                      {copy.demo.skip}
                    </button>
                  </div>
                )}

                {!revealed && !selected && (
                  <p className="mt-3 text-xs text-navy/50">{copy.demo.selectPrompt}</p>
                )}

                {revealed && (
                  <div className="mt-5">
                    <FeedbackPanel
                      correct={selected === current.correctOptionId}
                      explanation={current.explanation[language]}
                      takeaway={current.takeaway[language]}
                      onContinue={handleContinue}
                    />
                  </div>
                )}
              </ChallengeCard>
              <p className="mt-3 text-center text-xs text-navy/45">
                {challenges.length} · EduCAPTCHA
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
