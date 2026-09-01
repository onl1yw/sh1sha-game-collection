/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HatWordCard } from "../../../src/games/hat/features/turn/HatWordCard";

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

describe("Hat word card", () => {
  it.each([
    { endX: 180, direction: "correct", outcome: "correct" },
    { endX: 20, direction: "skipped", outcome: "skipped" },
  ] as const)("commits a $outcome swipe after its exit finishes", ({
    endX,
    direction,
    outcome,
  }) => {
    const onOutcome = vi.fn();
    const onTransitionChange = vi.fn();
    act(() => root.render(
      <HatWordCard
        word={{ id: "word-1", text: "Каскадёр", themeId: "cinema" }}
        prompt="Объясните слово"
        onOutcome={onOutcome}
        onTransitionChange={onTransitionChange}
      />,
    ));

    const card = container.querySelector<HTMLElement>('[role="group"]');
    if (!card) throw new Error("Missing Hat word card");
    card.setPointerCapture = vi.fn();
    act(() => {
      dispatchPointer(card, "pointerdown", 100);
      dispatchPointer(card, "pointermove", endX);
    });
    expect(card.dataset.direction).toBe(direction);

    act(() => dispatchPointer(card, "pointerup", endX));
    expect(card.dataset.exiting).toBe(outcome);
    expect(onOutcome).not.toHaveBeenCalled();
    expect(onTransitionChange).toHaveBeenCalledWith(true);

    act(() => root.render(
      <HatWordCard
        word={{ id: "word-2", text: "Режиссёр", themeId: "cinema" }}
        prompt="Объясните слово"
        onOutcome={onOutcome}
        onTransitionChange={onTransitionChange}
      />,
    ));
    expect(card.querySelector("strong")?.textContent).toBe("Каскадёр");

    act(() => {
      card.dispatchEvent(new Event("animationend", { bubbles: true }));
      card.dispatchEvent(new Event("webkitAnimationEnd", { bubbles: true }));
    });
    expect(onOutcome).toHaveBeenCalledOnce();
    expect(onOutcome).toHaveBeenCalledWith(outcome);
    expect(onTransitionChange).toHaveBeenLastCalledWith(false);
    expect(card.querySelector("strong")?.textContent).toBe("Режиссёр");
    expect(card.querySelector("strong")?.getAttribute("aria-live")).toBe("polite");
  });
});

function dispatchPointer(target: HTMLElement, type: string, clientX: number): void {
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX }));
}
