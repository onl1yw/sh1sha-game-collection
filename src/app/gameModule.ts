import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

export const GAME_MODULE_API_VERSION = 2 as const;

export interface GameHostPreferences {
  showSensitiveContent: boolean;
  soundEnabled: boolean;
  soundVolume: number;
}

export interface GameStorage {
  readonly namespace: string;
  /** Browser storage can throw; game infrastructure must contain that failure. */
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface GameModuleContext {
  storage: GameStorage | null;
}

export interface GameHostProps extends GameModuleContext {
  paused: boolean;
  preferences: GameHostPreferences;
  onExit: () => void;
  onOpenSettings: () => void;
}

export interface GameModule {
  apiVersion: typeof GAME_MODULE_API_VERSION;
  id: string;
  title: string;
  description: string;
  continueDescription?: string;
  Icon: LucideIcon;
  iconTone?: "accent" | "danger";
  order?: number;
  getCatalogState?: (
    context: GameModuleContext,
  ) => { hasSavedSession: boolean };
  load: () => Promise<{ default: ComponentType<GameHostProps> }>;
}

export function defineGame(game: GameModule): GameModule {
  return game;
}
