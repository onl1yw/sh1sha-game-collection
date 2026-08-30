import type { StorageLike, StorageResult } from "./storageResult";
import { storageError } from "./storageResult";

interface VersionedLoadOptions<T> {
  storage: StorageLike | null;
  currentKey: string;
  legacyKeys: readonly string[];
  migrate: (value: unknown) => T | null;
}

export function loadVersionedValue<T>({
  storage,
  currentKey,
  legacyKeys,
  migrate,
}: VersionedLoadOptions<T>): StorageResult<T | null> {
  if (!storage) {
    return storageError("unavailable", "Local storage is unavailable");
  }

  const keys = [currentKey, ...legacyKeys];
  for (const key of keys) {
    const readResult = readValue(storage, key);
    if (!readResult.ok) {
      return readResult;
    }
    if (readResult.value === null) {
      continue;
    }

    const migrated = migrate(readResult.value);
    if (!migrated) {
      safelyRemove(storage, key);
      return storageError("invalid-data", `Stored value at ${key} is invalid`);
    }

    if (key !== currentKey) {
      const writeResult = safelyWrite(storage, currentKey, migrated);
      if (!writeResult.ok) {
        return writeResult;
      }
      safelyRemove(storage, key);
    }
    return { ok: true, value: migrated };
  }

  return { ok: true, value: null };
}

export function saveVersionedValue<T>(
  storage: StorageLike | null,
  key: string,
  value: T,
): StorageResult<void> {
  if (!storage) {
    return storageError("unavailable", "Local storage is unavailable");
  }

  return safelyWrite(storage, key, value);
}

export function removeStoredValues(
  storage: StorageLike | null,
  keys: readonly string[],
): StorageResult<void> {
  if (!storage) {
    return storageError("unavailable", "Local storage is unavailable");
  }

  try {
    keys.forEach((key) => storage.removeItem(key));
    return { ok: true, value: undefined };
  } catch {
    return storageError("write-failed", "Could not clear local storage");
  }
}

function readValue(
  storage: StorageLike,
  key: string,
): StorageResult<unknown | null> {
  let serialized: string | null;
  try {
    serialized = storage.getItem(key);
  } catch {
    return storageError("read-failed", "Could not read local storage");
  }

  if (serialized === null) {
    return { ok: true, value: null };
  }

  try {
    return { ok: true, value: JSON.parse(serialized) as unknown };
  } catch {
    safelyRemove(storage, key);
    return storageError("invalid-data", `Stored value at ${key} is not JSON`);
  }
}

function safelyWrite<T>(
  storage: StorageLike,
  key: string,
  value: T,
): StorageResult<void> {
  try {
    storage.setItem(key, JSON.stringify(value));
    return { ok: true, value: undefined };
  } catch {
    return storageError("write-failed", "Could not write local storage");
  }
}

function safelyRemove(storage: StorageLike, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // Cleanup is best-effort. The original read result remains authoritative.
  }
}
