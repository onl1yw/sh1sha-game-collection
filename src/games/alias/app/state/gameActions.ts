import type { AliasSetup, AliasTeam, AliasWord, WinCondition, WordOutcome } from "../../domain/types";

export type AliasGameAction =
  | { type: "replace-teams"; teams: AliasTeam[] }
  | { type: "rename-team"; teamId: string; name: string }
  | { type: "toggle-theme"; themeId: string }
  | { type: "set-duration"; seconds: number }
  | { type: "set-skip-penalty"; enabled: boolean }
  | { type: "set-win-condition"; winCondition: WinCondition }
  | { type: "start-game"; deck: AliasWord[] }
  | { type: "start-round" }
  | { type: "record-word"; outcome: WordOutcome; nextDeck?: AliasWord[] }
  | { type: "finish-round" }
  | { type: "toggle-result"; entryId: string }
  | { type: "confirm-review" }
  | { type: "play-again" }
  | { type: "reset-setup"; setup: AliasSetup };
