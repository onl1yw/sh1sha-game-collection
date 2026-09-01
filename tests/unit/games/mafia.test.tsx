/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { gameModule } from "../../../src/games/mafia/gameModule";

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

describe("Мафия" + " game module", () => {
  it("exposes metadata and a lazy-loadable root screen", async () => {
    expect(gameModule.id).toBe("mafia");
    expect(gameModule.title).toBe("Мафия");
    expect(gameModule.iconTone).toBe("danger");

    const { default: Game } = await gameModule.load();
    const onExit = vi.fn();

    await act(async () => root.render(
      <Game
        paused={false}
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

    expect(container.querySelector("h1")?.textContent).toBe("Мафия");
    expect(container.querySelector(".lucide-cigarette")).not.toBeNull();
    expect(container.querySelector('button[aria-label="Настройки"]'))
      .not.toBeNull();
    const backButton = Array.from(container.querySelectorAll("button"))
      .find((button) => button.textContent?.includes("Назад"));
    act(() => backButton?.click());
    expect(onExit).toHaveBeenCalledOnce();
  });
});
