import { useContext } from "react";
import { GameContext, type GameContextValue } from "./gameContext";

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used inside GameProvider");
  }
  return context;
}
