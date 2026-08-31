import { useContext } from "react";

import { MafiaGameContext, type MafiaGameContextValue } from "./gameContext";

export function useMafiaGame(): MafiaGameContextValue {
  const value = useContext(MafiaGameContext);
  if (!value) throw new Error("useMafiaGame must be used within MafiaGameProvider");
  return value;
}
