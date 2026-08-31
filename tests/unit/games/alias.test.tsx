/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { gameModule } from "../../../src/games/alias/gameModule";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("Alias" + " game module", () => {
  it("exposes metadata and a lazy-loadable root screen", async () => {
    expect(gameModule.id).toBe("alias");
    expect(gameModule.title).toBe("Alias");

    const { default: Game } = await gameModule.load();
    const onExit = vi.fn();
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      return new Response(JSON.stringify(url.endsWith("manifest.json")
        ? {
            schemaVersion: 1,
            themes: [{ id: "cinema", file: "cinema.json", enabled: true }],
          }
        : {
            schemaVersion: 1,
            id: "cinema",
            name: "Кино",
            description: "Фильмы",
            words: Array.from({ length: 10 }, (_, index) => `Слово ${index}`),
          }), { status: 200, headers: { "Content-Type": "application/json" } });
    }));

    await act(async () => root.render(
      <Game
        storage={null}
        preferences={{
          showSensitiveContent: false,
          soundEnabled: true,
          soundVolume: 70,
        }}
        onExit={onExit}
        onOpenSettings={vi.fn()}
      />,
    ));
    await act(async () => Promise.resolve());

    expect(container.querySelector("h1")?.textContent).toBe("Alias");
    const backButton = Array.from(container.querySelectorAll("button"))
      .find((button) => button.textContent?.includes("Назад"));
    act(() => backButton?.click());
    expect(onExit).toHaveBeenCalledOnce();
  });
});
