import type { StorageLike } from "./storageResult";

export function getLegacySpyStorage(): StorageLike | null {
  try {
    return typeof globalThis.localStorage === "undefined"
      ? null
      : globalThis.localStorage;
  } catch {
    return null;
  }
}
