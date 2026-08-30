import type { GameRound, GameSettings } from "../../domain/game/types";
import { MAX_PLAYERS, MIN_PLAYERS } from "../../domain/game/playerLimits";
import type { Player } from "../../domain/player/types";
import type {
  CatalogTheme,
  ThemeLoadError,
} from "../ports/themeRepository";
import {
  createEmptyFairnessHistory,
  type FairnessHistory,
  type GamePhase,
  type GameSessionSnapshot,
} from "./persistenceModels";

export type { GamePhase } from "./persistenceModels";

export type ThemeCatalogStatus = "idle" | "loading" | "ready" | "error";

export interface ThemeCatalogState {
  status: ThemeCatalogStatus;
  themes: CatalogTheme[];
  errors: ThemeLoadError[];
}

export interface GameState {
  phase: GamePhase;
  selectedThemeId: string | null;
  players: Player[];
  settings: GameSettings;
  round: GameRound | null;
  roundStartedAtMs: number | null;
  currentPlayerIndex: number;
  catalog: ThemeCatalogState;
  fairnessHistory: FairnessHistory;
  errorMessage: string | null;
  storageWarning: string | null;
}

export interface InitialStateSources {
  session?: GameSessionSnapshot | null;
  fairnessHistory?: FairnessHistory | null;
  storageWarning?: string | null;
}

const DEFAULT_PLAYER_COUNT = 4;

export function createInitialGameState(
  sources: InitialStateSources = {},
): GameState {
  const session = sources.session;
  const base: GameState = {
    phase: "theme-selection",
    selectedThemeId: null,
    players: createPlayers(DEFAULT_PLAYER_COUNT),
    settings: { spyCount: 1, spyMode: "classic" },
    round: null,
    roundStartedAtMs: null,
    currentPlayerIndex: 0,
    catalog: { status: "idle", themes: [], errors: [] },
    fairnessHistory:
      sources.fairnessHistory ?? createEmptyFairnessHistory(),
    errorMessage: null,
    storageWarning: sources.storageWarning ?? null,
  };

  if (!session) {
    return base;
  }

  return {
    ...base,
    phase: session.phase === "role" ? "handoff" : session.phase,
    selectedThemeId: session.selectedThemeId,
    players: session.players.map((player) => ({ ...player })),
    settings: { ...session.settings },
    round: session.round ? copyRound(session.round) : null,
    roundStartedAtMs: session.roundStartedAtMs,
    currentPlayerIndex: session.currentPlayerIndex,
  };
}

export function toGameSessionSnapshot(
  state: GameState,
): GameSessionSnapshot {
  return {
    phase: state.phase === "role" ? "handoff" : state.phase,
    selectedThemeId: state.selectedThemeId,
    players: state.players.map((player) => ({ ...player })),
    settings: { ...state.settings },
    round: state.round ? copyRound(state.round) : null,
    roundStartedAtMs: state.roundStartedAtMs,
    currentPlayerIndex: state.currentPlayerIndex,
  };
}

export function createPlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `player-${index + 1}`,
    name: defaultPlayerName(index),
  }));
}

export function resizePlayers(
  players: readonly Player[],
  count: number,
  reservedPlayerIds: readonly string[] = [],
): Player[] {
  const boundedCount = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, count));
  const resized = players.slice(0, boundedCount).map((player) => ({ ...player }));
  const usedIds = new Set([
    ...players.map((player) => player.id),
    ...reservedPlayerIds,
  ]);

  while (resized.length < boundedCount) {
    const index = resized.length;
    const id = nextPlayerId(usedIds);
    usedIds.add(id);
    resized.push({ id, name: defaultPlayerName(index) });
  }
  return resized;
}

export function normalizePlayerNames(players: readonly Player[]): Player[] {
  return players.map((player, index) => ({
    ...player,
    name: player.name.trim() || defaultPlayerName(index),
  }));
}

function defaultPlayerName(index: number): string {
  return `Игрок ${index + 1}`;
}

function nextPlayerId(usedIds: ReadonlySet<string>): string {
  let sequence = 1;
  while (usedIds.has(`player-${sequence}`)) sequence += 1;
  return `player-${sequence}`;
}

function copyRound(round: GameRound): GameRound {
  return {
    ...round,
    assignments: round.assignments.map((assignment) => ({ ...assignment })),
  };
}
