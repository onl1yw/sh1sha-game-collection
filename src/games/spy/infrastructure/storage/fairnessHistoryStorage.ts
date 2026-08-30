import type { FairnessHistoryStore } from "../../app/ports/storage";
import type { FairnessHistory } from "../../app/state/persistenceModels";
import type { PersistedFairnessHistory } from "./migrations";
import { migrateFairnessHistory } from "./migrations";
import {
  loadVersionedValue,
  removeStoredValues,
  saveVersionedValue,
} from "./safeJsonStorage";
import {
  FAIRNESS_HISTORY_STORAGE_KEY,
  LEGACY_FAIRNESS_HISTORY_KEYS,
} from "./storageKeys";
import type { StorageLike, StorageResult } from "./storageResult";
import { storageError } from "./storageResult";
import {
  toFairnessHistory,
  toPersistedFairnessHistory,
} from "./storageMappers";

export type {
  FairnessHistoryStore,
} from "../../app/ports/storage";
export {
  createEmptyFairnessHistory,
} from "../../app/state/persistenceModels";

export class FairnessHistoryStorage implements FairnessHistoryStore {
  public constructor(
    private readonly storage: StorageLike | null = null,
  ) {}

  public load(): StorageResult<FairnessHistory | null> {
    const result = loadVersionedValue<PersistedFairnessHistory>({
      storage: this.storage,
      currentKey: FAIRNESS_HISTORY_STORAGE_KEY,
      legacyKeys: LEGACY_FAIRNESS_HISTORY_KEYS,
      migrate: migrateFairnessHistory,
    });
    if (!result.ok) return result;
    return {
      ok: true,
      value: result.value ? toFairnessHistory(result.value) : null,
    };
  }

  public save(history: FairnessHistory): StorageResult<void> {
    const normalized = migrateFairnessHistory(
      toPersistedFairnessHistory(history),
    );
    if (!normalized) {
      return storageError("invalid-data", "Fairness history is invalid");
    }
    return saveVersionedValue(
      this.storage,
      FAIRNESS_HISTORY_STORAGE_KEY,
      normalized,
    );
  }

  public clear(): StorageResult<void> {
    return removeStoredValues(this.storage, [
      FAIRNESS_HISTORY_STORAGE_KEY,
      ...LEGACY_FAIRNESS_HISTORY_KEYS,
    ]);
  }
}
