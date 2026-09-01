import type { HatSetup, HatTeam, HatWord } from "../../domain/types";

export type HatGameAction =
  | { type: "replace-teams"; teams: HatTeam[] }
  | { type: "rename-team"; teamId: string; name: string }
  | { type: "toggle-theme"; themeId: string }
  | { type: "set-word-count"; count: number }
  | { type: "set-duration"; seconds: number }
  | { type: "start-game"; masterWords: HatWord[] }
  | { type: "start-turn" }
  | { type: "mark-correct"; remainingMs: number }
  | { type: "skip-word"; queueWordIds: string[] }
  | { type: "expire-turn" }
  | { type: "toggle-claim"; wordId: string }
  | {
    type: "confirm-review";
    remainingWordIds: string[];
    nextStageWordIds?: string[];
  }
  | { type: "continue-next-stage"; nextStageWordIds: string[] }
  | { type: "carry-stage-time"; nextStageWordIds: string[] }
  | { type: "play-again" }
  | { type: "reset-setup"; setup: HatSetup };
