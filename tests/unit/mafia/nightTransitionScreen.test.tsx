/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NightTransitionScreen } from "../../../src/games/mafia/features/night/NightTransitionScreen";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("NightTransitionScreen", () => {
  it("counts 3, 2, 1 without ending the handoff early", () => {
    const onContinue = vi.fn();
    renderTransition(onContinue);

    expect(countdownValue()).toBe("3");
    expect(progressOffset()).toBe(0);
    act(() => vi.advanceTimersByTime(1000));
    expect(countdownValue()).toBe("2");
    expect(progressOffset()).toBeCloseTo(100 / 3);
    act(() => vi.advanceTimersByTime(1000));
    expect(countdownValue()).toBe("1");
    expect(progressOffset()).toBeCloseTo(200 / 3);
    expect(onContinue).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(999));
    expect(onContinue).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(countdownValue()).toBe("0");
    expect(progressOffset()).toBe(100);
    expect(onContinue).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(250));
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("keeps the logical delay when reduced motion is requested", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    const onContinue = vi.fn();
    renderTransition(onContinue);

    act(() => vi.advanceTimersByTime(3249));
    expect(onContinue).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("uses one stable accessible label instead of announcing every number", () => {
    renderTransition(vi.fn());

    expect(container.querySelector("h1")?.textContent).toBe("Ночной ход");
    expect(container.querySelector("footer")).not.toBeNull();
    const timer = container.querySelector('[role="timer"]');
    expect(timer?.getAttribute("aria-label"))
      .toBe("Отсчёт перед продолжением ночи");
    expect(timer?.getAttribute("aria-live")).toBe("off");
    expect(countdownElement()?.getAttribute("aria-hidden")).toBe("true");
  });
});

function renderTransition(onContinue: () => void): void {
  act(() => root.render(
    <NightTransitionScreen
      nightNumber={1}
      message="Мафия закрывает глаза"
      delayMs={3000}
      onContinue={onContinue}
    />,
  ));
}

function countdownElement(): HTMLElement | null {
  return container.querySelector("strong[aria-hidden='true']");
}

function countdownValue(): string | null {
  return countdownElement()?.textContent ?? null;
}

function progressOffset(): number | null {
  const value = container.querySelector("circle:last-child")?.getAttribute("stroke-dashoffset");
  return value === null || value === undefined ? null : Number(value);
}
