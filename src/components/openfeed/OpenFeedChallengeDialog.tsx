import { useEffect, useId, useRef } from "react";
import { SkipForward, X } from "lucide-react";
import { experienceMinigames } from "../../data/experienceMinigames";
import { useDemoSession } from "../../context/DemoSessionContext";
import { useI18n } from "../../i18n/I18nContext";
import { Logo } from "../Logo";
import { MinigameRenderer } from "../minigames/MinigameRenderer";

export function OpenFeedChallengeDialog() {
  const { flow, completeChallenge, skipChallenge, beginChallenge } =
    useDemoSession();
  const { language, copy } = useI18n();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const active =
    flow.status === "challenge-intro" ||
    flow.status === "challenge-active" ||
    flow.status === "challenge-feedback" ||
    flow.status === "transfer-active";

  const challengeId = active ? flow.challengeId : null;
  const reason = active ? flow.reason : null;
  const game = challengeId ? experienceMinigames[challengeId] : null;
  const isTransfer =
    flow.status === "transfer-active" ||
    (flow.status === "challenge-feedback" && flow.isTransfer);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (active && game) {
      if (!dialog.open) dialog.showModal();
      if (flow.status === "challenge-intro") beginChallenge();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [active, game, flow.status, beginChallenge]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      skipChallenge();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [skipChallenge]);

  const categoryLabel = game
    ? copy.categories[game.category as keyof typeof copy.categories]
    : "";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-[80] m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 open:flex open:items-stretch open:justify-center backdrop:bg-navy/55 sm:open:items-center sm:open:p-4"
    >
      {active && game && (
        <div className="flex h-full w-full max-w-[960px] flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-2xl">
          <header className="sticky top-0 z-10 flex shrink-0 items-start justify-between gap-3 border-b border-navy/8 bg-white px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <Logo size="sm" />
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-teal">
                {categoryLabel}
                {" · "}
                {isTransfer ? "2 of 2" : "1 of 2"}
              </p>
              <h2
                id={titleId}
                className="mt-1 text-base font-semibold text-navy"
              >
                {isTransfer
                  ? language === "es"
                    ? "Caso de transferencia"
                    : "Transfer case"
                  : game.title[language]}
              </h2>
              {reason && (
                <p className="mt-2 rounded-lg bg-amber/10 px-3 py-2 text-sm text-navy">
                  {reason[language]}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={skipChallenge}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-navy/15 px-3 text-sm font-medium text-navy/70"
              >
                <SkipForward className="h-4 w-4" aria-hidden />
                {copy.minigame.skip}
              </button>
              <button
                type="button"
                onClick={skipChallenge}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-navy/15"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            <MinigameRenderer
              key={`${challengeId}-${isTransfer ? "t" : "i"}`}
              challenge={game}
              embedded
              wide
              onComplete={completeChallenge}
              onSkip={skipChallenge}
            />
          </div>

          <footer className="sticky bottom-0 shrink-0 border-t border-navy/8 bg-white px-4 py-3 text-xs text-navy/50 sm:px-5">
            {language === "es"
              ? "Puedes omitir en cualquier momento. Nunca bloquea de forma permanente."
              : "You can skip anytime. It never permanently blocks."}
          </footer>
        </div>
      )}
    </dialog>
  );
}
