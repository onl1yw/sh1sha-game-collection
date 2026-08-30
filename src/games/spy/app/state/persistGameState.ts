import type {
  FairnessHistoryStore,
  GameSessionStore,
} from "../ports/storage";
import { toGameSessionSnapshot, type GameState } from "./gameState";

const SESSION_WARNING =
  "Игра работает, но браузер не сохраняет её. После перезагрузки текущий раунд может пропасть.";
const HISTORY_WARNING =
  "Игра сохранена, но история жеребьёвки может сброситься после перезагрузки.";

export function persistGameState(
  state: GameState,
  sessions: GameSessionStore,
  fairness: FairnessHistoryStore,
): string | null {
  try {
    const sessionResult = sessions.save(toGameSessionSnapshot(state));
    if (!sessionResult.ok) return SESSION_WARNING;

    const fairnessResult = fairness.save(state.fairnessHistory);
    return fairnessResult.ok ? null : HISTORY_WARNING;
  } catch {
    return SESSION_WARNING;
  }
}
