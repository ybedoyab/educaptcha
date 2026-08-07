import { useEffect, useId, useRef, useState } from "react";
import type { Challenge } from "../../types";
import type { ChallengeResult } from "../../types/minigame";
import { MinigameRenderer } from "../minigames/MinigameRenderer";

interface ContextualChallengeProps {
  challenge: Challenge;
  step: number;
  totalSteps: number;
  onComplete: (result: ChallengeResult) => void;
  onSkip: () => void;
  reason?: string;
}

export function ContextualChallenge({
  challenge,
  step,
  totalSteps,
  onComplete,
  onSkip,
  reason,
}: ContextualChallengeProps) {
  const [key, setKey] = useState(0);
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setKey((k) => k + 1);
  }, [challenge.id]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const onCancel = (e: Event) => {
      e.preventDefault();
      onSkip();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onSkip]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-[70] m-0 flex h-full max-h-none w-full max-w-none items-stretch justify-center border-0 bg-transparent p-0 backdrop:bg-navy/55 sm:items-center sm:p-4"
    >
      <div className="flex h-full w-full max-w-[900px] flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-2xl">
        <header className="sticky top-0 z-10 shrink-0 border-b border-navy/8 bg-white px-4 py-3">
          <h2 id={titleId} className="text-sm font-semibold text-navy">
            EduCAPTCHA · {step}/{totalSteps}
          </h2>
          {reason && (
            <p className="mt-2 rounded-lg bg-amber/10 px-3 py-2 text-sm text-navy">
              {reason}
            </p>
          )}
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          <MinigameRenderer
            key={key}
            challenge={challenge}
            wide
            stepLabel={`${step}/${totalSteps}`}
            onComplete={onComplete}
            onSkip={onSkip}
          />
        </div>
      </div>
    </dialog>
  );
}
