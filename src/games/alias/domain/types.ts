export interface AliasTeam {
  id: string;
  name: string;
}

export interface AliasWord {
  id: string;
  text: string;
  themeId: string;
}

export type WinCondition =
  | { type: "points"; target: number }
  | { type: "rounds"; roundsPerTeam: number };

export interface AliasSetup {
  teams: AliasTeam[];
  selectedThemeIds: string[];
  durationSeconds: number;
  penalizeSkips: boolean;
  winCondition: WinCondition;
}

export type WordOutcome = "correct" | "skipped";

export interface RoundWord {
  id: string;
  word: AliasWord;
  outcome: WordOutcome;
}

export interface AliasSession {
  setup: AliasSetup;
  scores: Record<string, number>;
  roundsPlayed: Record<string, number>;
  activeTeamIndex: number;
  roundNumber: number;
  deck: AliasWord[];
  cursor: number;
}

export type AliasGameState =
  | { phase: "setup"; setup: AliasSetup }
  | { phase: "ready"; session: AliasSession }
  | { phase: "round"; session: AliasSession; entries: RoundWord[] }
  | { phase: "review"; session: AliasSession; entries: RoundWord[] }
  | { phase: "results"; session: AliasSession };
