import type {
  LoverMode,
  RoleAssignment,
  UniqueRoleCount,
} from "../../domain/types";

export type EditableUniqueRole = "don" | "commissioner" | "doctor" | "lover" | "maniac";

export type MafiaGameAction =
  | { type: "set-player-count"; count: number }
  | { type: "set-player-name"; playerId: string; name: string }
  | { type: "set-mafia-count"; count: number }
  | { type: "set-unique-role"; role: EditableUniqueRole; count: UniqueRoleCount }
  | { type: "set-lover-mode"; mode: LoverMode }
  | { type: "set-host-by-lot"; enabled: boolean }
  | { type: "set-death-reveal"; reveal: boolean }
  | { type: "roles-dealt"; assignments: RoleAssignment[]; playerNames: ReadonlyMap<string, string> }
  | { type: "reveal-role" }
  | { type: "hide-role" }
  | { type: "start-night" }
  | { type: "select-night-target"; playerId: string }
  | { type: "confirm-night-action" }
  | { type: "finish-night-step" }
  | { type: "continue-night" }
  | { type: "continue-dawn" }
  | { type: "start-vote" }
  | { type: "back-to-discussion" }
  | { type: "select-vote-target"; playerId: string }
  | { type: "confirm-vote" }
  | { type: "continue-elimination" }
  | { type: "return-to-setup" }
  | { type: "set-error"; message: string | null };

export const NO_ELIMINATION_ID = "no-elimination";
