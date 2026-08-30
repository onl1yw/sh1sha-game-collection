import { useCallback, useMemo, useRef, type Dispatch } from "react";
import { createRound } from "../../domain/game/createRound";
import type { RandomSource } from "../../domain/random";
import type {
  FairnessHistoryStore,
  GameSessionStore,
} from "../ports/storage";
import type { ThemeRepository } from "../ports/themeRepository";
import type { GameAction, GameCommands } from "./gameActions";
import { toGameTheme } from "./catalogTheme";
import { normalizePlayerNames, type GameState } from "./gameState";
import { createEmptyFairnessHistory } from "./persistenceModels";
import { buildNextFairnessHistory } from "./roundHistory";

interface CommandDependencies {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  themes: ThemeRepository;
  random: RandomSource;
  sessions: GameSessionStore;
  fairness: FairnessHistoryStore;
}

export function useGameCommands({
  state,
  dispatch,
  themes,
  random,
  sessions,
  fairness,
}: CommandDependencies): GameCommands {
  const latestThemeRequest = useRef(0);
  const reloadThemes = useCallback(async (signal?: AbortSignal) => {
    const requestId = latestThemeRequest.current + 1;
    latestThemeRequest.current = requestId;
    dispatch({ type: "catalog-loading" });
    try {
      const result = await themes.loadThemes(signal);
      if (signal?.aborted || requestId !== latestThemeRequest.current) return;
      dispatch({ type: "catalog-loaded", ...result });
    } catch {
      if (signal?.aborted || requestId !== latestThemeRequest.current) return;
      dispatch({
        type: "catalog-loaded",
        themes: [],
        errors: [
          {
            code: "network",
            message: "Theme repository failed unexpectedly",
          },
        ],
      });
    }
  }, [dispatch, themes]);

  const startRound = useCallback(() => {
    if (state.phase !== "setup" && state.phase !== "results") return;
    const theme = state.catalog.themes.find(
      (candidate) => candidate.id === state.selectedThemeId,
    );
    if (!theme) {
      dispatch({ type: "set-error", message: "Выбранная тематика недоступна" });
      return;
    }

    try {
      const gameTheme = toGameTheme(theme);
      const players = normalizePlayerNames(state.players);
      const roundNumber = state.fairnessHistory.roundNumber + 1;
      const result = createRound({
        players,
        settings: state.settings,
        theme: gameTheme,
        spyHistory: state.fairnessHistory.spies,
        firstPlayerHistory: state.fairnessHistory.starters,
        recentWords: state.fairnessHistory.recentWordsByTheme[theme.id] ?? [],
        roundNumber,
        random,
      });
      const fairnessHistory = buildNextFairnessHistory({
        previous: state.fairnessHistory,
        players,
        theme: gameTheme,
        round: result.round,
        nextSpyHistory: result.nextSpyHistory,
      });
      dispatch({
        type: "round-created",
        players,
        round: result.round,
        fairnessHistory,
      });
    } catch (error) {
      dispatch({
        type: "set-error",
        message: error instanceof Error
          ? error.message
          : "Не удалось создать раунд",
      });
    }
  }, [dispatch, random, state]);

  return useMemo(
    () => ({
      reloadThemes,
      chooseTheme: (themeId: string) =>
        dispatch({ type: "choose-theme", themeId }),
      backToThemes: () => dispatch({ type: "back-to-themes" }),
      setPlayerCount: (count: number) =>
        dispatch({ type: "set-player-count", count }),
      setPlayerName: (playerId: string, name: string) =>
        dispatch({ type: "set-player-name", playerId, name }),
      setSpyCount: (count: number) =>
        dispatch({ type: "set-spy-count", count }),
      setSpyMode: (mode) => dispatch({ type: "set-spy-mode", mode }),
      startRound,
      revealRole: () => dispatch({ type: "reveal-role" }),
      hideRole: () => dispatch({ type: "hide-role" }),
      startPlaying: () => dispatch({
        type: "start-playing",
        startedAtMs: Date.now(),
      }),
      showResults: () => dispatch({ type: "show-results" }),
      cancelRound: () => dispatch({ type: "cancel-round" }),
      playAgain: startRound,
      newGame: () => dispatch({ type: "new-game" }),
      resetGame: () => {
        safelyClear(sessions);
        dispatch({ type: "reset-game" });
      },
      resetHistory: () => {
        safelyClear(fairness);
        dispatch({
          type: "reset-history",
          fairnessHistory: createEmptyFairnessHistory(),
        });
      },
      clearError: () => dispatch({ type: "clear-error" }),
    }),
    [dispatch, fairness, reloadThemes, sessions, startRound],
  );
}

function safelyClear(store: { clear(): unknown }): void {
  try {
    store.clear();
  } catch {
    // Resetting in-memory state is still useful when persistence is blocked.
  }
}
