import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  experienceScenarios,
  getScenario,
} from "../../data/experienceScenarios";
import { useI18n } from "../../i18n/I18nContext";
import type { SectionId } from "../../types";
import type {
  ExperiencePhase,
  FeedPostData,
  LearningSession,
} from "../../types/learning";
import { useLearningSession } from "../../hooks/useLearningSession";
import { BrowserFrame } from "./BrowserFrame";
import { ContextualChallenge } from "./ContextualChallenge";
import { ExperienceIntro } from "./ExperienceIntro";
import { LearningResult } from "./LearningResult";
import { SocialFeed } from "./SocialFeed";
import { VerificationPanel } from "./VerificationPanel";

interface RealWorldExperienceProps {
  onNavigate: (id: SectionId) => void;
  learningApi: ReturnType<typeof useLearningSession>;
}

export function RealWorldExperience({
  onNavigate,
  learningApi,
}: RealWorldExperienceProps) {
  const { language, copy } = useI18n();
  const { history, markIntroSeen, recordSession } = learningApi;

  const [scenarioId, setScenarioId] = useState(
    () => history.lastScenarioId ?? "emotional-pressure",
  );
  const scenario = getScenario(
    scenarioId === "image-context" ? "image-context" : "emotional-pressure",
  );

  const [phase, setPhase] = useState<ExperiencePhase>(() =>
    history.introSeen ? "browsing" : "intro",
  );
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
  const [initialCorrect, setInitialCorrect] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [completedSession, setCompletedSession] =
    useState<LearningSession | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [shareCorrection, setShareCorrection] = useState<string | null>(null);

  const feedRef = useRef<HTMLDivElement>(null);

  const resetRun = useCallback(
    (nextScenarioId: string, keepIntro = true) => {
      setScenarioId(nextScenarioId);
      setPhase(keepIntro && history.introSeen ? "browsing" : "intro");
      setHighlightedPostId(null);
      setInitialCorrect(false);
      setSkipped(false);
      setCompletedSession(null);
      setLikedIds(new Set());
      setSavedIds(new Set());
      setToast(null);
      setShareCorrection(null);
    },
    [history.introSeen],
  );

  const scrollToTransfer = useCallback(() => {
    const transfer = scenario.posts.find((p) => p.isTransferTarget);
    if (!transfer) return;
    setHighlightedPostId(transfer.id);
    window.setTimeout(() => {
      const el = document.getElementById(`post-${transfer.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }, [scenario.posts]);

  useEffect(() => {
    if (phase === "apply-hint" || phase === "transfer") {
      scrollToTransfer();
    }
  }, [phase, scrollToTransfer]);

  const finishSession = useCallback(
    (transferOk: boolean) => {
      const session: LearningSession = {
        skill: scenario.skill,
        initialCorrect,
        transferCorrect: transferOk,
        skipped,
        completedAt: new Date().toISOString(),
      };
      setCompletedSession(session);
      recordSession(session);
      setPhase("result");
    },
    [scenario.skill, initialCorrect, skipped, recordSession],
  );

  const handleShare = (post: FeedPostData) => {
    if (phase !== "browsing") return;
    if (post.isTarget) {
      setHighlightedPostId(post.id);
      setPhase("challenge");
      return;
    }
    setToast(copy.experience.commentSoon);
    window.setTimeout(() => setToast(null), 2000);
  };

  const handleStart = () => {
    markIntroSeen();
    setPhase("browsing");
  };

  const handleAnswer = (correct: boolean) => {
    setInitialCorrect(correct);
    setSkipped(false);
    setPhase("feedback");
  };

  const handleSkipChallenge = () => {
    setSkipped(true);
    setInitialCorrect(false);
    setPhase("apply-hint");
    window.setTimeout(() => setPhase("transfer"), 900);
  };

  const handleContinueFromFeedback = () => {
    setPhase("apply-hint");
    window.setTimeout(() => setPhase("transfer"), 900);
  };

  const handleVerify = () => {
    setShareCorrection(null);
    setPhase("verify-panel");
  };

  const handleShareImmediate = () => {
    setShareCorrection(scenario.transfer.shareCorrection[language]);
    setPhase("transfer-retry");
  };

  return (
    <section
      id="experience"
      className="scroll-mt-20 border-b border-navy/10 bg-[#0B1220]"
      aria-labelledby="experience-title"
    >
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="mb-8 max-w-2xl">
          <h2
            id="experience-title"
            className="font-display text-2xl font-bold text-white sm:text-3xl"
          >
            {copy.experience.title}
          </h2>
          <p className="mt-2 text-sm text-white/65 sm:text-base">
            {copy.experience.subtitle}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <p className="mr-2 self-center text-xs font-semibold uppercase tracking-wide text-white/45">
              {copy.experience.chooseScenario}
            </p>
            {experienceScenarios.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => resetRun(s.id)}
                aria-pressed={scenario.id === s.id}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  scenario.id === s.id
                    ? "bg-teal text-white"
                    : "bg-white/10 text-white/75 hover:bg-white/15"
                }`}
              >
                {s.title[language]}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <BrowserFrame>
            <SocialFeed
              scenario={scenario}
              language={language}
              highlightedPostId={highlightedPostId}
              transferMode={
                phase === "transfer" ||
                phase === "transfer-retry" ||
                phase === "verify-panel" ||
                phase === "apply-hint"
              }
              showTransferActions={
                phase === "transfer" || phase === "transfer-retry"
              }
              likedIds={likedIds}
              savedIds={savedIds}
              feedRef={feedRef}
              onShare={handleShare}
              onLike={(id) =>
                setLikedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                })
              }
              onSave={(id) =>
                setSavedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                })
              }
              onComment={() => {
                setToast(copy.experience.commentSoon);
                window.setTimeout(() => setToast(null), 2000);
              }}
              onVerify={handleVerify}
              onShareImmediate={handleShareImmediate}
            />
          </BrowserFrame>

          {phase === "apply-hint" && (
            <div className="pointer-events-none absolute inset-x-0 top-16 z-10 flex justify-center px-4">
              <p className="animate-fade-in rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white shadow-lg">
                {copy.experience.applyHint}
              </p>
            </div>
          )}

          {(phase === "verify-panel" || phase === "transfer-retry") && (
            <div className="absolute inset-x-3 bottom-3 z-20 sm:inset-x-6 sm:bottom-6">
              {phase === "verify-panel" ? (
                <VerificationPanel
                  facts={scenario.transfer.verifyFacts}
                  language={language}
                  onContinue={() => finishSession(true)}
                />
              ) : (
                <div className="animate-slide-up rounded-2xl border border-amber/40 bg-white p-4 shadow-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber" aria-hidden />
                    <p className="text-sm text-navy/80">{shareCorrection}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShareCorrection(null);
                      setPhase("transfer");
                    }}
                    className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-white"
                  >
                    {copy.experience.tryVerifyAgain}
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === "result" && completedSession && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-navy/50 p-3 sm:p-6">
              <div className="max-h-full w-full max-w-xl overflow-y-auto">
                <LearningResult
                  scenario={scenario}
                  session={completedSession}
                  language={language}
                  onTryAnother={(id) => resetRun(id)}
                  onNavigate={onNavigate}
                />
              </div>
            </div>
          )}

          {phase === "intro" && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-navy/45 p-4">
              <ExperienceIntro onStart={handleStart} />
            </div>
          )}

          {(phase === "challenge" || phase === "feedback") && (
            <ContextualChallenge
              scenario={scenario}
              step={1}
              totalSteps={2}
              detailed={phase === "feedback" && !initialCorrect}
              phase={phase}
              answeredCorrect={phase === "feedback" ? initialCorrect : null}
              onAnswer={handleAnswer}
              onSkip={handleSkipChallenge}
              onContinue={handleContinueFromFeedback}
            />
          )}

          {toast && (
            <div
              className="absolute bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-navy px-4 py-2 text-xs font-medium text-white shadow-lg"
              role="status"
            >
              {toast}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
