import { lazy, type LazyExoticComponent, type ComponentType } from "react";

import {
  GAME_MODULE_API_VERSION,
  type GameStorage,
  type GameHostProps,
  type GameModule,
} from "./gameModule";

interface GameModuleFile {
  gameModule: GameModule;
}

const GAME_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const discoveredFiles = import.meta.glob<GameModuleFile>(
  "../games/*/gameModule.ts",
  { eager: true },
);

export interface RegisteredGame extends GameModule {
  App: LazyExoticComponent<ComponentType<GameHostProps>>;
}

export const gameModules = buildGameRegistry(discoveredFiles);

export function findGameModule(gameId: string): RegisteredGame | undefined {
  return gameModules.find((game) => game.id === gameId);
}

export function gameIsVisibleInCatalog(
  game: GameModule,
  showSensitiveContent: boolean,
): boolean {
  return !game.requiresSensitiveContent || showSensitiveContent;
}

export function buildGameRegistry(
  files: Readonly<Record<string, GameModuleFile>>,
): readonly RegisteredGame[] {
  const games = Object.entries(files).map(([path, file]) => {
    const folderId = gameFolderId(path);
    validateGameModule(file.gameModule, folderId, path);
    return { ...file.gameModule, App: lazy(file.gameModule.load) };
  });
  const ids = games.map((game) => game.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("Game registry contains duplicate ids");
  }
  return games.sort((left, right) =>
    (left.order ?? 100) - (right.order ?? 100) ||
    left.title.localeCompare(right.title, "ru") ||
    left.id.localeCompare(right.id),
  );
}

function gameFolderId(path: string): string {
  const match = path.match(/\/games\/([^/]+)\/gameModule\.ts$/);
  if (!match?.[1]) throw new Error(`Invalid game module path: ${path}`);
  return match[1];
}

function validateGameModule(
  game: GameModule | undefined,
  folderId: string,
  path: string,
): asserts game is GameModule {
  if (!game || !GAME_ID_PATTERN.test(game.id)) {
    throw new Error(`Invalid game module id in ${path}`);
  }
  if (game.id !== folderId) {
    throw new Error(`Game id ${game.id} must match folder ${folderId}`);
  }
  if (game.apiVersion !== GAME_MODULE_API_VERSION) {
    throw new Error(`Game module ${game.id} uses an unsupported API version`);
  }
  if (!game.title.trim() || !game.description.trim() || !game.Icon || !game.load) {
    throw new Error(`Game module ${game.id} has incomplete metadata`);
  }
  if (
    game.requiresSensitiveContent !== undefined
    && typeof game.requiresSensitiveContent !== "boolean"
  ) {
    throw new Error(`Game module ${game.id} has invalid catalog visibility`);
  }
}

export function gameCatalogState(
  game: GameModule,
  storage: GameStorage | null,
): { hasSavedSession: boolean } {
  try {
    return game.getCatalogState?.({ storage }) ?? { hasSavedSession: false };
  } catch {
    return { hasSavedSession: false };
  }
}
