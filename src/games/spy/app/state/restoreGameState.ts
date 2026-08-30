import type {
  FairnessHistoryStore,
  GameSessionStore,
} from "../ports/storage";
import { createInitialGameState, type GameState } from "./gameState";
import type {
  FairnessHistory,
  GameSessionSnapshot,
} from "./persistenceModels";

export function restoreGameState(
  sessions: GameSessionStore,
  fairness: FairnessHistoryStore,
): GameState {
  const sessionResult = safelyLoadSession(sessions);
  const fairnessResult = safelyLoadFairness(fairness);
  const warnings = [sessionResult.warning, fairnessResult.warning].filter(
    (warning): warning is string => Boolean(warning),
  );

  return createInitialGameState({
    session: sessionResult.value,
    fairnessHistory: fairnessResult.value,
    storageWarning: warnings.length > 0 ? warnings.join(" ") : null,
  });
}

function safelyLoadSession(store: GameSessionStore): {
  value: GameSessionSnapshot | null;
  warning: string | null;
} {
  try {
    const result = store.load();
    return result.ok
      ? { value: result.value, warning: null }
      : { value: null, warning: "Не удалось восстановить текущую игру." };
  } catch {
    return { value: null, warning: "Не удалось восстановить текущую игру." };
  }
}

function safelyLoadFairness(store: FairnessHistoryStore): {
  value: FairnessHistory | null;
  warning: string | null;
} {
  try {
    const result = store.load();
    return result.ok
      ? { value: result.value, warning: null }
      : { value: null, warning: "История жеребьёвки была сброшена." };
  } catch {
    return { value: null, warning: "История жеребьёвки была сброшена." };
  }
}
