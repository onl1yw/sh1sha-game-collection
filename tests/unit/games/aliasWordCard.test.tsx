/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WordCard } from "../../../src/games/alias/features/round/WordCard";

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

describe("Alias word card", () => {
  it.each([
    { endX: 180, direction: "correct", outcome: "correct" },
    { endX: 20, direction: "skipped", outcome: "skipped" },
  ] as const)("marks a $outcome directional swipe", ({ endX, direction, outcome }) => {
    const onSwipe = vi.fn();
    const onTransitionChange = vi.fn();
    act(() => root.render(
      <WordCard
        word={{ id: "word-1", text: "Каскадёр", themeId: "cinema" }}
        onSwipe={onSwipe}
        onTransitionChange={onTransitionChange}
      />,
    ));

    const card = container.querySelector<HTMLElement>('[role="group"]');
    if (!card) throw new Error("Missing word card");
    card.setPointerCapture = vi.fn();

    act(() => {
      dispatchPointer(card, "pointerdown", 100);
      dispatchPointer(card, "pointermove", endX);
    });
    expect(card.dataset.direction).toBe(direction);

    act(() => dispatchPointer(card, "pointerup", endX));
    expect(card.dataset.exiting).toBe(outcome);
    expect(onSwipe).toHaveBeenCalledWith(outcome);
    expect(onTransitionChange).toHaveBeenCalledWith(true);

    act(() => root.render(
      <WordCard
        word={{ id: "word-2", text: "Режиссёр", themeId: "cinema" }}
        onSwipe={onSwipe}
        onTransitionChange={onTransitionChange}
      />,
    ));
    expect(card.querySelector("strong")?.textContent).toBe("Каскадёр");

    act(() => {
      card.dispatchEvent(new Event("animationend", { bubbles: true }));
      card.dispatchEvent(new Event("webkitAnimationEnd", { bubbles: true }));
    });
    expect(onSwipe).toHaveBeenCalledOnce();
    expect(onTransitionChange).toHaveBeenLastCalledWith(false);
    expect(card.dataset.direction).toBe("idle");
    expect(card.querySelector("strong")?.textContent).toBe("Режиссёр");
  });
});

function dispatchPointer(target: HTMLElement, type: string, clientX: number): void {
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX }));
}
