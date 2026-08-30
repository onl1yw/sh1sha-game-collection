import type { GameAction } from "./gameActions";
import {
  createInitialGameState,
  resizePlayers,
  type GameState,
} from "./gameState";

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "catalog-loading":
      return {
        ...state,
        catalog: { ...state.catalog, status: "loading", errors: [] },
      };
    case "catalog-loaded":
      return catalogLoaded(state, action.themes, action.errors);
    case "choose-theme":
      return chooseTheme(state, action.themeId);
    case "back-to-themes":
      return state.phase === "setup"
        ? { ...state, phase: "theme-selection", errorMessage: null }
        : state;
    case "set-player-count":
      return setPlayerCount(state, action.count);
    case "set-player-name":
      return setupOnly(state, {
        players: state.players.map((player) =>
          player.id === action.playerId
            ? { ...player, name: action.name }
            : player,
        ),
      });
    case "set-spy-count":
      return setSpyCount(state, action.count);
    case "set-spy-mode":
      return setupOnly(state, {
        settings: { ...state.settings, spyMode: action.mode },
      });
    case "round-created":
      if (state.phase !== "setup" && state.phase !== "results") return state;
      return {
        ...state,
        phase: "handoff",
        players: action.players,
        round: action.round,
        roundStartedAtMs: null,
        currentPlayerIndex: 0,
        fairnessHistory: action.fairnessHistory,
        errorMessage: null,
      };
    case "reveal-role":
      return state.phase === "handoff"
        ? { ...state, phase: "role", errorMessage: null }
        : state;
    case "hide-role":
      return hideRole(state);
    case "start-playing":
      return state.phase === "ready" && isValidTimestamp(action.startedAtMs)
        ? {
            ...state,
            phase: "active",
            roundStartedAtMs: action.startedAtMs,
            errorMessage: null,
          }
        : state;
    case "show-results":
      return state.phase === "active"
        ? { ...state, phase: "results", errorMessage: null }
        : state;
    case "cancel-round":
      return cancelRound(state);
    case "new-game":
      return newGame(state);
    case "reset-game":
      return resetGame(state);
    case "reset-history":
      return { ...state, fairnessHistory: action.fairnessHistory };
    case "set-error":
      return { ...state, errorMessage: action.message };
    case "clear-error":
      return state.errorMessage === null
        ? state
        : { ...state, errorMessage: null };
    case "set-storage-warning":
      return state.storageWarning === action.message
        ? state
        : { ...state, storageWarning: action.message };
  }
}

function catalogLoaded(
  state: GameState,
  themes: GameState["catalog"]["themes"],
  errors: GameState["catalog"]["errors"],
): GameState {
  const hasSelectedTheme = themes.some(
    (theme) => theme.id === state.selectedThemeId,
  );
  const cannotResumeSetup = state.phase === "setup" && !hasSelectedTheme;
  const errorMessage = themes.length === 0
    ? "Не удалось загрузить ни одной тематики"
    : null;

  return {
    ...state,
    phase: cannotResumeSetup ? "theme-selection" : state.phase,
    selectedThemeId: cannotResumeSetup ? null : state.selectedThemeId,
    catalog: {
      status: themes.length > 0 ? "ready" : "error",
      themes,
      errors,
    },
    errorMessage,
  };
}

function chooseTheme(state: GameState, themeId: string): GameState {
  if (state.phase !== "theme-selection") return state;
  if (!state.catalog.themes.some((theme) => theme.id === themeId)) {
    return { ...state, errorMessage: "Эта тематика недоступна" };
  }
  return {
    ...state,
    phase: "setup",
    selectedThemeId: themeId,
    errorMessage: null,
  };
}

function setPlayerCount(state: GameState, count: number): GameState {
  if (state.phase !== "setup") return state;
  if (!Number.isInteger(count)) {
    return { ...state, errorMessage: "Количество игроков должно быть целым" };
  }

  const reservedPlayerIds = fairnessPlayerIds(state);
  const players = resizePlayers(state.players, count, reservedPlayerIds);
  return {
    ...state,
    players,
    settings: {
      ...state.settings,
      spyCount: Math.min(state.settings.spyCount, players.length - 1),
    },
    errorMessage: null,
  };
}

function fairnessPlayerIds(state: GameState): string[] {
  return [
    ...state.fairnessHistory.spies.map((entry) => entry.playerId),
    ...state.fairnessHistory.starters.map((entry) => entry.playerId),
  ];
}

function setSpyCount(state: GameState, count: number): GameState {
  if (state.phase !== "setup") return state;
  const maximum = state.players.length - 1;
  if (!Number.isInteger(count) || count < 1 || count > maximum) {
    return { ...state, errorMessage: `Шпионов должно быть от 1 до ${maximum}` };
  }
  return {
    ...state,
    settings: { ...state.settings, spyCount: count },
    errorMessage: null,
  };
}

function hideRole(state: GameState): GameState {
  if (state.phase !== "role") return state;
  const nextIndex = state.currentPlayerIndex + 1;
  return {
    ...state,
    phase: nextIndex < state.players.length ? "handoff" : "ready",
    currentPlayerIndex: nextIndex,
    errorMessage: null,
  };
}

function cancelRound(state: GameState): GameState {
  if (!["handoff", "role", "ready", "active"].includes(state.phase)) {
    return state;
  }
  return {
    ...state,
    phase: "setup",
    round: null,
    roundStartedAtMs: null,
    currentPlayerIndex: 0,
    errorMessage: null,
  };
}

function newGame(state: GameState): GameState {
  return {
    ...state,
    phase: "theme-selection",
    selectedThemeId: null,
    round: null,
    roundStartedAtMs: null,
    currentPlayerIndex: 0,
    errorMessage: null,
  };
}

function isValidTimestamp(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

function resetGame(state: GameState): GameState {
  const reset = createInitialGameState({
    fairnessHistory: state.fairnessHistory,
    storageWarning: state.storageWarning,
  });
  return { ...reset, catalog: state.catalog };
}

function setupOnly(
  state: GameState,
  patch: Partial<Pick<GameState, "players" | "settings">>,
): GameState {
  return state.phase === "setup"
    ? { ...state, ...patch, errorMessage: null }
    : state;
}
