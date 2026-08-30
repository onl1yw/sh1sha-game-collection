import type { GameSessionStore } from "../../app/ports/storage";
import type { GameSessionSnapshot } from "../../app/state/persistenceModels";
import type { PersistedGameSession } from "./migrations";
import { migrateGameSession } from "./migrations";
import {
  loadVersionedValue,
  removeStoredValues,
  saveVersionedValue,
} from "./safeJsonStorage";
import {
  GAME_SESSION_STORAGE_KEY,
  LEGACY_GAME_SESSION_KEYS,
} from "./storageKeys";
import type { StorageLike, StorageResult } from "./storageResult";
import { storageError } from "./storageResult";
import {
  toGameSessionSnapshot,
  toPersistedGameSession,
} from "./storageMappers";

export type { GameSessionStore } from "../../app/ports/storage";

export class GameSessionStorage implements GameSessionStore {
  public constructor(
    private readonly storage: StorageLike | null = null,
  ) {}

  public load(): StorageResult<GameSessionSnapshot | null> {
    const result = loadVersionedValue<PersistedGameSession>({
      storage: this.storage,
      currentKey: GAME_SESSION_STORAGE_KEY,
      legacyKeys: LEGACY_GAME_SESSION_KEYS,
      migrate: migrateGameSession,
    });
    if (!result.ok) return result;
    return {
      ok: true,
      value: result.value ? toGameSessionSnapshot(result.value) : null,
    };
  }

  public save(session: GameSessionSnapshot): StorageResult<void> {
    const normalized = migrateGameSession(toPersistedGameSession(session));
    if (!normalized) {
      return storageError("invalid-data", "Game session is invalid");
    }
    return saveVersionedValue(
      this.storage,
      GAME_SESSION_STORAGE_KEY,
      normalized,
    );
  }

  public clear(): StorageResult<void> {
    return removeStoredValues(this.storage, [
      GAME_SESSION_STORAGE_KEY,
      ...LEGACY_GAME_SESSION_KEYS,
    ]);
  }
}
