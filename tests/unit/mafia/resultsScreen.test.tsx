/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { narrationForState } from "../../../src/games/mafia/app/narration";
import { createInitialGameState } from "../../../src/games/mafia/app/state/gameState";
import { ResultsScreen } from "../../../src/games/mafia/features/results/ResultsScreen";

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

describe("Mafia draw presentation", () => {
  it("shows and narrates an explicit draw", () => {
    act(() => root.render(
      <ResultsScreen
        winner="draw"
        players={[]}
        onOpenSettings={vi.fn()}
        onPlayAgain={vi.fn()}
        onExit={vi.fn()}
      />,
    ));

    expect(container.querySelector("h1")?.textContent).toBe("Ничья");
    expect(container.textContent).toContain("В городе не осталось выживших");
    expect(narrationForState({
      ...createInitialGameState(),
      phase: { kind: "results", winner: "draw" },
    })).toEqual({
      clipId: "result-draw",
      text: "Ничья. В городе не осталось выживших.",
    });
  });

  it("uses the same plain action hierarchy as the Spy results screen", () => {
    const onPlayAgain = vi.fn();
    const onExit = vi.fn();
    act(() => root.render(
      <ResultsScreen
        winner="town"
        players={[]}
        onOpenSettings={vi.fn()}
        onPlayAgain={onPlayAgain}
        onExit={onExit}
      />,
    ));

    const actionButtons = Array.from(
      container.querySelectorAll<HTMLButtonElement>("footer button"),
    );
    expect(actionButtons.map((button) => button.textContent?.trim())).toEqual([
      "Ещё партию",
      "Все игры",
    ]);
    expect(container.querySelector("footer svg")).toBeNull();

    act(() => actionButtons[0]?.click());
    act(() => actionButtons[1]?.click());
    expect(onPlayAgain).toHaveBeenCalledOnce();
    expect(onExit).toHaveBeenCalledOnce();
  });
});
