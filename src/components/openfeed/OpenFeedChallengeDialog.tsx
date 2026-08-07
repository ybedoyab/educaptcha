import { useEffect, useId, useRef } from "react";
import { experienceMinigames } from "../../data/experienceMinigames";
import { useDemoSession } from "../../context/DemoSessionContext";
import { useI18n } from "../../i18n/I18nContext";
import { MinigameRenderer } from "../minigames/MinigameRenderer";

export function OpenFeedChallengeDialog() {
  const { challenge, challengeReason, completeChallenge, skipChallenge } =
    useDemoSession();
  const { language } = useI18n();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (challenge) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [challenge]);

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

  const game = challenge
    ? experienceMinigames[challenge.minigameId]
    : null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-[80] m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 open:flex open:items-stretch open:justify-center backdrop:bg-navy/55 sm:open:items-center sm:open:p-4"
    >
      {challenge && game && (
        <div className="flex h-full w-full max-w-[900px] flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-2xl">
          <header className="sticky top-0 z-10 shrink-0 border-b border-navy/8 bg-white px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal">
              EduCAPTCHA
            </p>
            <h2 id={titleId} className="mt-1 text-base font-semibold text-navy">
              {challenge.phase === "transfer"
                ? language === "es"
                  ? "Caso de transferencia"
                  : "Transfer case"
                : game.title[language]}
            </h2>
            {challengeReason && (
              <p className="mt-2 rounded-lg bg-amber/10 px-3 py-2 text-sm text-navy">
                {challengeReason[language]}
              </p>
            )}
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
            <MinigameRenderer
              key={`${challenge.minigameId}-${challenge.phase}`}
              challenge={game}
              wide
              onComplete={completeChallenge}
              onSkip={skipChallenge}
            />
          </div>
        </div>
      )}
    </dialog>
  );
}
