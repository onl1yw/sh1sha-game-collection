import type { GameRound, SpyMode } from "../../domain/game/types";
import type { Player } from "../../domain/player/types";
import type {
  CatalogTheme,
  ThemeLoadError,
} from "../ports/themeRepository";
import type { FairnessHistory } from "./persistenceModels";

export type GameAction =
  | { type: "catalog-loading" }
  | {
      type: "catalog-loaded";
      themes: CatalogTheme[];
      errors: ThemeLoadError[];
    }
  | { type: "choose-theme"; themeId: string }
  | { type: "back-to-themes" }
  | { type: "set-player-count"; count: number }
  | { type: "set-player-name"; playerId: string; name: string }
  | { type: "set-spy-count"; count: number }
  | { type: "set-spy-mode"; mode: SpyMode }
  | {
      type: "round-created";
      players: Player[];
      round: GameRound;
      fairnessHistory: FairnessHistory;
    }
  | { type: "reveal-role" }
  | { type: "hide-role" }
  | { type: "start-playing"; startedAtMs: number }
  | { type: "show-results" }
  | { type: "cancel-round" }
  | { type: "new-game" }
  | { type: "reset-game" }
  | { type: "reset-history"; fairnessHistory: FairnessHistory }
  | { type: "set-error"; message: string }
  | { type: "clear-error" }
  | { type: "set-storage-warning"; message: string | null };

export interface GameCommands {
  reloadThemes(signal?: AbortSignal): Promise<void>;
  chooseTheme(themeId: string): void;
  backToThemes(): void;
  setPlayerCount(count: number): void;
  setPlayerName(playerId: string, name: string): void;
  setSpyCount(count: number): void;
  setSpyMode(mode: SpyMode): void;
  startRound(): void;
  revealRole(): void;
  hideRole(): void;
  startPlaying(): void;
  showResults(): void;
  cancelRound(): void;
  playAgain(): void;
  newGame(): void;
  resetGame(): void;
  resetHistory(): void;
  clearError(): void;
}
