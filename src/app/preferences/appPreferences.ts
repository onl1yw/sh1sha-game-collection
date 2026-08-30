import type { ColorTheme } from "../../shared/ui/colorTheme";

export type { ColorTheme } from "../../shared/ui/colorTheme";

export interface AppPreferences {
  colorTheme: ColorTheme;
  showSensitiveThemes: boolean;
}

export interface PreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const STORAGE_KEY = "sh1sha-game-collection.preferences.v1";

export const DEFAULT_APP_PREFERENCES: Readonly<AppPreferences> = {
  colorTheme: "dark",
  showSensitiveThemes: false,
};

export function loadAppPreferences(
  storage: PreferenceStorage | null = browserStorage(),
): AppPreferences {
  if (!storage) return { ...DEFAULT_APP_PREFERENCES };

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_APP_PREFERENCES };
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || parsed.schemaVersion !== 1) {
      return { ...DEFAULT_APP_PREFERENCES };
    }
    return {
      colorTheme: isColorTheme(parsed.colorTheme)
        ? parsed.colorTheme
        : DEFAULT_APP_PREFERENCES.colorTheme,
      showSensitiveThemes: typeof parsed.showSensitiveThemes === "boolean"
        ? parsed.showSensitiveThemes
        : DEFAULT_APP_PREFERENCES.showSensitiveThemes,
    };
  } catch {
    return { ...DEFAULT_APP_PREFERENCES };
  }
}

export function saveAppPreferences(
  preferences: AppPreferences,
  storage: PreferenceStorage | null = browserStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      ...preferences,
    }));
  } catch {
    // Preferences stay usable in memory when browser storage is unavailable.
  }
}

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isColorTheme(value: unknown): value is ColorTheme {
  return value === "dark" || value === "light";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
