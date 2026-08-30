import type { GameModuleContext } from "../../app/gameModule";
import { SPY_SESSION_STORAGE_KEY } from "./identity";

export function readSpyCatalogState({
  storage,
}: GameModuleContext): { hasSavedSession: boolean } {
  try {
    const serialized = storage?.getItem(SPY_SESSION_STORAGE_KEY);
    if (!serialized) return { hasSavedSession: false };
    const value = JSON.parse(serialized) as unknown;
    return {
      hasSavedSession: isRecord(value) &&
        typeof value.phase === "string" &&
        value.phase !== "theme-selection",
    };
  } catch {
    return { hasSavedSession: false };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
