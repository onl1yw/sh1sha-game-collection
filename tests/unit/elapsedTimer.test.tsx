/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ElapsedTimer } from "../../src/games/spy/features/round/ElapsedTimer";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

describe("ElapsedTimer", () => {
  it("counts elapsed round time without drifting from the clock", () => {
    act(() => root.render(<ElapsedTimer />));
    expect(container.textContent).toContain("00:00");

    act(() => vi.advanceTimersByTime(65_000));

    expect(container.textContent).toContain("01:05");
    expect(container.querySelector("time")?.dateTime).toBe("PT65S");
  });

  it("continues from a restored start timestamp", () => {
    const startedAtMs = Date.now() - 125_000;

    act(() => root.render(<ElapsedTimer startedAtMs={startedAtMs} />));

    expect(container.textContent).toContain("02:05");
    expect(container.querySelector("time")?.dateTime).toBe("PT125S");
  });
});
