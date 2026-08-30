import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import type { RandomSource } from "../../domain/random";
import { CryptoRandomSource } from "../../infrastructure/random/CryptoRandomSource";
import { FairnessHistoryStorage } from "../../infrastructure/storage/fairnessHistoryStorage";
import { GameSessionStorage } from "../../infrastructure/storage/gameSessionStorage";
import type { StorageLike } from "../../infrastructure/storage/storageResult";
import { HttpThemeRepository } from "../../infrastructure/themes/HttpThemeRepository";
import type {
  FairnessHistoryStore,
  GameSessionStore,
} from "../ports/storage";
import type { ThemeRepository } from "../ports/themeRepository";
import { GameContext } from "./gameContext";
import { gameReducer } from "./gameReducer";
import { persistGameState } from "./persistGameState";
import { restoreGameState } from "./restoreGameState";
import { useGameCommands } from "./useGameCommands";

export interface SpyGameProviderProps {
  children: ReactNode;
  themeRepository?: ThemeRepository;
  randomSource?: RandomSource;
  sessionStore?: GameSessionStore;
  fairnessStore?: FairnessHistoryStore;
  storage?: StorageLike | null;
}

export function SpyGameProvider({
  children,
  themeRepository,
  randomSource,
  sessionStore,
  fairnessStore,
  storage,
}: SpyGameProviderProps) {
  const themes = useMemo(
    () => themeRepository ?? new HttpThemeRepository(),
    [themeRepository],
  );
  const random = useMemo(
    () => randomSource ?? new CryptoRandomSource(),
    [randomSource],
  );
  const sessions = useMemo(
    () => sessionStore ?? new GameSessionStorage(storage),
    [sessionStore, storage],
  );
  const fairness = useMemo(
    () => fairnessStore ?? new FairnessHistoryStorage(storage),
    [fairnessStore, storage],
  );
  const initialState = useMemo(
    () => restoreGameState(sessions, fairness),
    [sessions, fairness],
  );
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const lastPersistenceWarning = useRef<string | null>(null);
  const actions = useGameCommands({
    state,
    dispatch,
    themes,
    random,
    sessions,
    fairness,
  });
  const { reloadThemes } = actions;

  useEffect(() => {
    const controller = new AbortController();
    void reloadThemes(controller.signal);
    return () => controller.abort();
  }, [reloadThemes]);

  useEffect(() => {
    const warning = persistGameState(state, sessions, fairness);
    if (warning !== lastPersistenceWarning.current) {
      lastPersistenceWarning.current = warning;
      dispatch({ type: "set-storage-warning", message: warning });
    }
  }, [fairness, sessions, state]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
