/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { gameModule } from "../../../src/games/__GAME_ID__/gameModule";

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
});

describe(__GAME_TITLE_JSON__ + " game module", () => {
  it("exposes metadata and a lazy-loadable root screen", async () => {
    expect(gameModule.id).toBe(__GAME_ID_JSON__);
    expect(gameModule.title).toBe(__GAME_TITLE_JSON__);

    const { default: Game } = await gameModule.load();
    const onExit = vi.fn();

    await act(async () => root.render(
      <Game
        storage={null}
        preferences={{ showSensitiveContent: false }}
        onExit={onExit}
        onOpenSettings={vi.fn()}
      />,
    ));

    expect(container.querySelector("h1")?.textContent).toBe(__GAME_TITLE_JSON__);
    const backButton = Array.from(container.querySelectorAll("button"))
      .find((button) => button.textContent?.includes("All games"));
    act(() => backButton?.click());
    expect(onExit).toHaveBeenCalledOnce();
  });
});
