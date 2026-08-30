import type {
  FairnessHistory,
  GameSessionSnapshot,
} from "../state/persistenceModels";

export type StorageErrorCode =
  | "unavailable"
  | "read-failed"
  | "write-failed"
  | "invalid-data";

export interface StorageError {
  code: StorageErrorCode;
  message: string;
}

export type StorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: StorageError };

export interface GameSessionStore {
  load(): StorageResult<GameSessionSnapshot | null>;
  save(session: GameSessionSnapshot): StorageResult<void>;
  clear(): StorageResult<void>;
}

export interface FairnessHistoryStore {
  load(): StorageResult<FairnessHistory | null>;
  save(history: FairnessHistory): StorageResult<void>;
  clear(): StorageResult<void>;
}
