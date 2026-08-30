import { describe, expect, it } from "vitest";

import { createGameStorage } from "../../src/app/gameStorage";

describe("game storage", () => {
  it("isolates equal logical keys between games", () => {
    const backend = new MemoryStorage();
    const spy = createGameStorage("spy", backend);
    const alias = createGameStorage("alias", backend);

    spy?.setItem("session:v1", "spy-state");
    alias?.setItem("session:v1", "alias-state");

    expect(spy?.getItem("session:v1")).toBe("spy-state");
    expect(alias?.getItem("session:v1")).toBe("alias-state");
    expect(backend.values).toEqual(new Map([
      ["sh1sha-games:spy:session:v1", "spy-state"],
      ["sh1sha-games:alias:session:v1", "alias-state"],
    ]));
  });

  it("returns null when browser storage is unavailable", () => {
    expect(createGameStorage("spy", null)).toBeNull();
  });

  it("exposes backend failures for the game adapter to contain", () => {
    const failing = createGameStorage("spy", {
      getItem: () => { throw new Error("denied"); },
      setItem: () => { throw new Error("quota"); },
      removeItem: () => { throw new Error("denied"); },
    });

    expect(() => failing?.getItem("session:v1")).toThrow("denied");
    expect(() => failing?.setItem("session:v1", "value")).toThrow("quota");
  });
});

class MemoryStorage {
  public readonly values = new Map<string, string>();

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
