import type { LocalizedText } from "../types";
import type { ChallengeResult } from "../types/minigame";

export type PendingIntent =
  | {
      type: "share";
      postId: string;
      returnElementId: string;
    }
  | {
      type: "comment";
      postId: string;
      body: string;
      parentId?: string;
      returnElementId: string;
    }
  | {
      type: "repost-image";
      postId: string;
      returnElementId: string;
    }
  | {
      type: "save";
      postId: string;
      returnElementId: string;
    };

export type OutcomeRecord = {
  postId: string;
  skill?: string;
  initial?: ChallengeResult;
  transfer?: ChallengeResult;
  skipped?: boolean;
  evidenceInspected?: boolean;
  firstDecision?: string;
  transferDecision?: string;
  completedAt: string;
};

export type DemoFlowState =
  | { status: "idle" }
  | {
      status: "challenge-intro";
      intent: PendingIntent;
      challengeId: string;
      transferChallengeId?: string;
      skill?: string;
      reason: LocalizedText;
      isTransfer?: boolean;
    }
  | {
      status: "challenge-active";
      intent: PendingIntent;
      challengeId: string;
      transferChallengeId?: string;
      skill?: string;
      reason: LocalizedText;
      isTransfer?: boolean;
    }
  | {
      status: "challenge-feedback";
      intent: PendingIntent;
      challengeId: string;
      transferChallengeId?: string;
      skill?: string;
      reason: LocalizedText;
      result: ChallengeResult;
      isTransfer?: boolean;
      initialResult?: ChallengeResult;
    }
  | {
      status: "return-to-context";
      intent: PendingIntent;
      result: ChallengeResult;
      transferChallengeId?: string;
      skill?: string;
      transferPostId?: string;
    }
  | {
      status: "transfer-pending";
      targetPostId: string;
      skill: string;
      challengeId: string;
      initialResult: ChallengeResult;
      sourcePostId: string;
    }
  | {
      status: "transfer-active";
      targetPostId: string;
      challengeId: string;
      initialResult: ChallengeResult;
      intent: PendingIntent;
      skill: string;
      reason: LocalizedText;
    }
  | {
      status: "completed";
      outcome: OutcomeRecord;
    };

export type DemoFlowAction =
  | {
      type: "START_CHALLENGE";
      intent: PendingIntent;
      challengeId: string;
      transferChallengeId?: string;
      skill?: string;
      reason: LocalizedText;
      transferPostId?: string;
    }
  | { type: "BEGIN_ACTIVE" }
  | { type: "SHOW_FEEDBACK"; result: ChallengeResult }
  | { type: "CONTINUE_AFTER_FEEDBACK"; transferPostId?: string }
  | {
      type: "COMPLETE_INITIAL";
      result: ChallengeResult;
      transferPostId?: string;
    }
  | { type: "COMPLETE_TRANSFER_DONE"; result: ChallengeResult }
  | { type: "RESOLVE_INTENT"; transferPostId?: string }
  | { type: "CANCEL_INTENT"; transferPostId?: string }
  | {
      type: "SKIP_CHALLENGE";
      result: ChallengeResult;
      transferPostId?: string;
    }
  | {
      type: "START_TRANSFER";
      intent: PendingIntent;
      reason: LocalizedText;
    }
  | { type: "COMPLETE_TRANSFER"; result: ChallengeResult }
  | { type: "RESET_FLOW" };

export function demoFlowReducer(
  state: DemoFlowState,
  action: DemoFlowAction,
): DemoFlowState {
  switch (action.type) {
    case "START_CHALLENGE":
      return {
        status: "challenge-intro",
        intent: action.intent,
        challengeId: action.challengeId,
        transferChallengeId: action.transferChallengeId,
        skill: action.skill,
        reason: action.reason,
        isTransfer: false,
      };

    case "BEGIN_ACTIVE":
      if (state.status === "challenge-intro") {
        return { ...state, status: "challenge-active" };
      }
      if (state.status === "transfer-active") {
        return state;
      }
      return state;

    case "SHOW_FEEDBACK":
      if (state.status === "challenge-active") {
        return {
          status: "challenge-feedback",
          intent: state.intent,
          challengeId: state.challengeId,
          transferChallengeId: state.transferChallengeId,
          skill: state.skill,
          reason: state.reason,
          result: action.result,
          isTransfer: state.isTransfer,
        };
      }
      if (state.status === "transfer-active") {
        return {
          status: "challenge-feedback",
          intent: state.intent,
          challengeId: state.challengeId,
          skill: state.skill,
          reason: state.reason,
          result: action.result,
          isTransfer: true,
          initialResult: state.initialResult,
        };
      }
      return state;

    case "CONTINUE_AFTER_FEEDBACK":
      if (state.status !== "challenge-feedback") return state;
      if (state.isTransfer) {
        return {
          status: "completed",
          outcome: {
            postId: state.intent.postId,
            skill: state.skill,
            initial: state.initialResult,
            transfer: state.result,
            evidenceInspected: true,
            firstDecision: state.initialResult?.correct
              ? "identified"
              : "missed",
            transferDecision: state.result.correct ? "identified" : "missed",
            completedAt: new Date().toISOString(),
          },
        };
      }
      return {
        status: "return-to-context",
        intent: state.intent,
        result: state.result,
        transferChallengeId: state.transferChallengeId,
        skill: state.skill,
        transferPostId: action.transferPostId,
      };

    case "COMPLETE_INITIAL":
      if (
        state.status === "challenge-intro" ||
        state.status === "challenge-active" ||
        state.status === "challenge-feedback"
      ) {
        if (state.isTransfer) {
          return {
            status: "completed",
            outcome: {
              postId: state.intent.postId,
              skill: state.skill,
              initial:
                state.status === "challenge-feedback"
                  ? state.initialResult
                  : undefined,
              transfer:
                state.status === "challenge-feedback"
                  ? action.result
                  : action.result,
              evidenceInspected: true,
              firstDecision:
                state.status === "challenge-feedback" && state.initialResult
                  ? state.initialResult.correct
                    ? "identified"
                    : "missed"
                  : undefined,
              transferDecision: action.result.correct
                ? "identified"
                : "missed",
              completedAt: new Date().toISOString(),
            },
          };
        }
        return {
          status: "return-to-context",
          intent: state.intent,
          result: action.result,
          transferChallengeId: state.transferChallengeId,
          skill: state.skill,
          transferPostId: action.transferPostId,
        };
      }
      return state;

    case "COMPLETE_TRANSFER_DONE":
      if (state.status === "transfer-active") {
        return {
          status: "completed",
          outcome: {
            postId: state.targetPostId,
            skill: state.skill,
            initial: state.initialResult,
            transfer: action.result,
            evidenceInspected: true,
            firstDecision: state.initialResult.correct
              ? "identified"
              : "missed",
            transferDecision: action.result.correct ? "identified" : "missed",
            completedAt: new Date().toISOString(),
          },
        };
      }
      if (state.status === "challenge-feedback" && state.isTransfer) {
        return {
          status: "completed",
          outcome: {
            postId: state.intent.postId,
            skill: state.skill,
            initial: state.initialResult,
            transfer: action.result,
            evidenceInspected: true,
            firstDecision: state.initialResult?.correct
              ? "identified"
              : "missed",
            transferDecision: action.result.correct ? "identified" : "missed",
            completedAt: new Date().toISOString(),
          },
        };
      }
      return state;

    case "RESOLVE_INTENT":
    case "CANCEL_INTENT":
      if (state.status === "return-to-context") {
        const transferPostId =
          action.transferPostId ?? state.transferPostId ?? "";
        if (state.transferChallengeId && state.skill) {
          return {
            status: "transfer-pending",
            targetPostId: transferPostId,
            skill: state.skill,
            challengeId: state.transferChallengeId,
            initialResult: state.result,
            sourcePostId: state.intent.postId,
          };
        }
        return {
          status: "completed",
          outcome: {
            postId: state.intent.postId,
            skill: state.skill,
            initial: state.result,
            evidenceInspected: true,
            firstDecision: state.result.correct ? "identified" : "missed",
            completedAt: new Date().toISOString(),
          },
        };
      }
      if (state.status === "challenge-intro" || state.status === "challenge-active") {
        return { status: "idle" };
      }
      return { status: "idle" };

    case "SKIP_CHALLENGE":
      if (
        state.status === "challenge-intro" ||
        state.status === "challenge-active" ||
        state.status === "challenge-feedback"
      ) {
        if (state.isTransfer || ("isTransfer" in state && state.isTransfer)) {
          return {
            status: "completed",
            outcome: {
              postId: state.intent.postId,
              skill: state.skill,
              skipped: true,
              completedAt: new Date().toISOString(),
            },
          };
        }
        return {
          status: "return-to-context",
          intent: state.intent,
          result: action.result,
          transferChallengeId: state.transferChallengeId,
          skill: state.skill,
          transferPostId: action.transferPostId,
        };
      }
      if (state.status === "transfer-active") {
        return {
          status: "completed",
          outcome: {
            postId: state.targetPostId,
            skill: state.skill,
            initial: state.initialResult,
            skipped: true,
            completedAt: new Date().toISOString(),
          },
        };
      }
      return { status: "idle" };

    case "START_TRANSFER":
      if (state.status !== "transfer-pending") return state;
      return {
        status: "transfer-active",
        targetPostId: state.targetPostId,
        challengeId: state.challengeId,
        initialResult: state.initialResult,
        intent: action.intent,
        skill: state.skill,
        reason: action.reason,
      };

    case "COMPLETE_TRANSFER":
      if (state.status !== "transfer-active") return state;
      return {
        status: "challenge-feedback",
        intent: state.intent,
        challengeId: state.challengeId,
        skill: state.skill,
        reason: state.reason,
        result: action.result,
        isTransfer: true,
        initialResult: state.initialResult,
      };

    case "RESET_FLOW":
      return { status: "idle" };

    default:
      return state;
  }
}

export const initialDemoFlowState: DemoFlowState = { status: "idle" };
