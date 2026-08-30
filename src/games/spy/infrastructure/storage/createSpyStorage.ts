import { getLegacySpyStorage } from "./legacySpyStorage";
import type { StorageLike } from "./storageResult";

export function createSpyStorage(
  scopedStorage: StorageLike | null,
  legacyStorage: StorageLike | null = getLegacySpyStorage(),
): StorageLike | null {
  if (!scopedStorage) return null;

  return {
    getItem(key) {
      const current = scopedStorage.getItem(key);
      if (current !== null || !legacyStorage) return current;

      const legacy = legacyStorage.getItem(key);
      if (legacy === null) return null;
      scopedStorage.setItem(key, legacy);
      legacyStorage.removeItem(key);
      return legacy;
    },
    setItem: (key, value) => scopedStorage.setItem(key, value),
    removeItem(key) {
      scopedStorage.removeItem(key);
      legacyStorage?.removeItem(key);
    },
  };
}
