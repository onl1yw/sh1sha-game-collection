import { describe, expect, it } from "vitest";

import {
  DEFAULT_APP_PREFERENCES,
  loadAppPreferences,
  saveAppPreferences,
  type PreferenceStorage,
} from "../../src/app/preferences/appPreferences";
import { filterVisibleThemes } from "../../src/games/spy/app/filterThemes";

describe("app preferences", () => {
  it("uses safe defaults when nothing has been stored", () => {
    expect(loadAppPreferences(new MemoryStorage())).toEqual(
      DEFAULT_APP_PREFERENCES,
    );
  });

  it("persists color and sensitive-content preferences", () => {
    const storage = new MemoryStorage();
    saveAppPreferences(
      { colorTheme: "light", showSensitiveThemes: true },
      storage,
    );

    expect(loadAppPreferences(storage)).toEqual({
      colorTheme: "light",
      showSensitiveThemes: true,
    });
  });

  it("falls back without throwing on corrupted data", () => {
    const storage = new MemoryStorage("not-json");

    expect(loadAppPreferences(storage)).toEqual(DEFAULT_APP_PREFERENCES);
  });

  it("hides sensitivity-tagged themes unless the setting is enabled", () => {
    const themes = [
      { id: "safe" },
      { id: "sensitive", sensitive: true },
    ];

    expect(filterVisibleThemes(themes, false).map((theme) => theme.id))
      .toEqual(["safe"]);
    expect(filterVisibleThemes(themes, true)).toBe(themes);
  });
});

class MemoryStorage implements PreferenceStorage {
  private value: string | null;

  public constructor(value: string | null = null) {
    this.value = value;
  }

  public getItem(): string | null {
    return this.value;
  }

  public setItem(_key: string, value: string): void {
    this.value = value;
  }
}
