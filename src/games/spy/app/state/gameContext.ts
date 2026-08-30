import { createContext } from "react";
import type { GameCommands } from "./gameActions";
import type { GameState } from "./gameState";

export interface GameContextValue {
  state: GameState;
  actions: GameCommands;
}

export const GameContext = createContext<GameContextValue | null>(null);
