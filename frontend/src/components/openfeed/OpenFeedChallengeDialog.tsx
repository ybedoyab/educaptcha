import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { experienceMinigames } from "../../data/experienceMinigames";
import { useDemoSession } from "../../context/DemoSessionContext";
import { useI18n } from "../../i18n/I18nContext";
import { Logo } from "../Logo";
import { MinigameRenderer } from "../minigames/MinigameRenderer";
import { OPEN_FEED_ERRORS } from "./openFeed.errors";

export function OpenFeedChallengeDialog() {
  const { flow, completeChallenge, skipChallenge, beginChallenge } =
    useDemoSession();
  const { language } = useI18n();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const active =
    flow.status === "challenge-intro" ||
    flow.status === "challenge-active" ||
    flow.status === "challenge-feedback" ||
    flow.status === "transfer-active";

  const challengeId = active ? flow.challengeId : null;
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
    if (active && !game) {
      console.error(OPEN_FEED_ERRORS.unknownChallenge(challengeId));
      skipChallenge();
    }
  }, [active, game, challengeId, skipChallenge]);

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

  // Small brand mark only — the in-game steps carry the actionable title.
  const brandHint = isTransfer
    ? language === "es"
      ? "Otra foto para revisar"
      : "Another photo to check"
    : language === "es"
      ? "Pausa de verificación"
      : "Verification pause";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-[80] m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 open:flex open:items-stretch open:justify-center backdrop:bg-navy/55 sm:open:items-center sm:open:p-4"
    >
      {active && game && (
        <div className="flex h-full w-full max-w-[560px] flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-2xl">
          <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-navy/8 bg-white px-4 py-2.5">
            <div className="min-w-0">
              <Logo size="sm" />
              <p id={titleId} className="sr-only">
                {brandHint}
              </p>
              <p className="mt-0.5 text-xs text-navy/70" aria-hidden>
                {brandHint}
              </p>
            </div>
            <button
              type="button"
              onClick={skipChallenge}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-navy/15"
              aria-label={language === "es" ? "Cerrar" : "Close"}
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <MinigameRenderer
              key={`${challengeId}-${isTransfer ? "t" : "i"}`}
              challenge={game}
              embedded
              compactFeedback
              interceptReason={
                active && "reason" in flow ? flow.reason[language] : null
              }
              onComplete={completeChallenge}
              onSkip={skipChallenge}
            />
          </div>
        </div>
      )}
    </dialog>
  );
}
