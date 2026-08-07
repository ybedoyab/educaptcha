import { useEffect, useState } from "react";
import type { Challenge } from "../../types";
import type { ChallengeResult } from "../../types/minigame";
import { MinigameRenderer } from "../minigames/MinigameRenderer";

interface ContextualChallengeProps {
  challenge: Challenge;
  step: number;
  totalSteps: number;
  onComplete: (result: ChallengeResult) => void;
  onSkip: () => void;
}

export function ContextualChallenge({
  challenge,
  step,
  totalSteps,
  onComplete,
  onSkip,
}: ContextualChallengeProps) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((k) => k + 1);
  }, [challenge.id]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-navy/55 p-0 sm:items-center sm:p-4">
      <div className="animate-slide-up max-h-[94vh] w-full overflow-y-auto sm:max-w-lg">
        <MinigameRenderer
          key={key}
          challenge={challenge}
          compact
          stepLabel={`${step}/${totalSteps}`}
          onComplete={onComplete}
          onSkip={onSkip}
        />
      </div>
    </div>
  );
}
