export const HAT_STAGES = ["describe", "gestures", "one-word"] as const;

export type HatStage = (typeof HAT_STAGES)[number];

export interface HatTeam {
  id: string;
  name: string;
}

export interface HatWord {
  id: string;
  text: string;
  themeId: string;
}

export interface HatSetup {
  teams: HatTeam[];
  selectedThemeIds: string[];
  wordCount: number;
  durationSeconds: number;
}

export type TeamValues = Record<string, number>;

export type StageTeamValues = Record<HatStage, TeamValues>;

export interface HatSession {
  setup: HatSetup;
  masterWords: HatWord[];
  stageIndex: 0 | 1 | 2;
  remainingWordIds: string[];
  activeTeamIndex: number;
  scores: TeamValues;
  stageScores: StageTeamValues;
  timeCreditsMs: TeamValues;
  turnsStarted: TeamValues;
  activePlayMs: Record<HatStage, number>;
}

export interface CorrectClaim {
  wordId: string;
  included: boolean;
}

export interface TurnDraft {
  teamId: string;
  segmentBudgetMs: number;
  queueWordIds: string[];
  correctClaims: CorrectClaim[];
  skippedAttempts: number;
}

export type TurnEnd =
  | { reason: "timeout"; remainingMs: 0 }
  | { reason: "pool-empty"; remainingMs: number };

export type HatGameState =
  | { phase: "setup"; setup: HatSetup }
  | { phase: "ready"; session: HatSession }
  | { phase: "turn"; session: HatSession; draft: TurnDraft }
  | {
    phase: "review";
    session: HatSession;
    draft: TurnDraft;
    end: TurnEnd;
  }
  | { phase: "stage-choice"; session: HatSession; remainingMs: number }
  | { phase: "results"; session: HatSession };
