import type { GameStorage } from "./gameModule";

interface StorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const STORAGE_ROOT = "sh1sha-games";

export function createGameStorage(
  gameId: string,
  backend: StorageBackend | null = browserStorage(),
): GameStorage | null {
  if (!backend) return null;
  const namespace = `${STORAGE_ROOT}:${gameId}`;
  const keyFor = (key: string) => `${namespace}:${key}`;

  return {
    namespace,
    getItem: (key) => backend.getItem(keyFor(key)),
    setItem: (key, value) => backend.setItem(keyFor(key), value),
    removeItem: (key) => backend.removeItem(keyFor(key)),
  };
}

function browserStorage(): StorageBackend | null {
  try {
    return typeof globalThis.localStorage === "undefined"
      ? null
      : globalThis.localStorage;
  } catch {
    return null;
  }
}
