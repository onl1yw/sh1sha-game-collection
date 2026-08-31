import type {
  MafiaWinner,
  NightActions,
  NightCheckResult,
  NightStep,
} from "../../domain/types";

export type MafiaGamePhase =
  | { kind: "setup" }
  | { kind: "deal-cover"; playerIndex: number }
  | { kind: "deal-role"; playerIndex: number }
  | { kind: "night-cover"; nightNumber: number }
  | NightStepPhase
  | NightFeedbackPhase
  | NightTransitionPhase
  | {
      kind: "dawn";
      nightNumber: number;
      eliminatedPlayerIds: readonly string[];
      pendingWinner: MafiaWinner | null;
    }
  | { kind: "discussion"; dayNumber: number }
  | { kind: "vote"; dayNumber: number; selectedPlayerId: string | null }
  | {
      kind: "elimination";
      dayNumber: number;
      playerId: string | null;
      pendingWinner: MafiaWinner | null;
    }
  | { kind: "results"; winner: MafiaWinner };

export interface NightStepPhase {
  kind: "night-step";
  nightNumber: number;
  plan: readonly NightStep[];
  stepIndex: number;
  actions: NightActions;
  selectedPlayerId: string | null;
}

export interface NightFeedbackPhase {
  kind: "night-feedback";
  nightNumber: number;
  plan: readonly NightStep[];
  stepIndex: number;
  actions: NightActions;
  result: NightCheckResult;
}

export interface NightTransitionPhase {
  kind: "night-transition";
  nightNumber: number;
  plan: readonly NightStep[];
  nextStepIndex: number;
  actions: NightActions;
  message: string;
  delayMs: number;
}
