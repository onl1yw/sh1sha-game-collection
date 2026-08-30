import { describe, expect, it } from "vitest";

import { createSpyStorage } from "../../../src/games/spy/infrastructure/storage/createSpyStorage";

describe("legacy Spy storage", () => {
  it("moves an old value into scoped platform storage on first read", () => {
    const scoped = new MemoryStorage();
    const legacy = new MemoryStorage([["spy-game:session:v1", "saved"]]);
    const storage = createSpyStorage(scoped, legacy);

    expect(storage?.getItem("spy-game:session:v1")).toBe("saved");
    expect(scoped.getItem("spy-game:session:v1")).toBe("saved");
    expect(legacy.getItem("spy-game:session:v1")).toBeNull();
  });
});

class MemoryStorage {
  private readonly values: Map<string, string>;

  public constructor(entries: [string, string][] = []) {
    this.values = new Map(entries);
  }

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  public removeItem(key: string): void {
    this.values.delete(key);
  }
}
