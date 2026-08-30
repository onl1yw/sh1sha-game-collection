import type {
  StorageErrorCode,
  StorageResult,
} from "../../app/ports/storage";

export type {
  StorageError,
  StorageErrorCode,
  StorageResult,
} from "../../app/ports/storage";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function storageError(
  code: StorageErrorCode,
  message: string,
): StorageResult<never> {
  return { ok: false, error: { code, message } };
}
