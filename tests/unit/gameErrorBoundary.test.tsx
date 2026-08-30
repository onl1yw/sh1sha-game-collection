/** @vitest-environment jsdom */

import { act, lazy, Suspense } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GameErrorBoundary } from "../../src/app/GameErrorBoundary";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe("GameErrorBoundary", () => {
  it("keeps the collection reachable after a render failure", () => {
    const onExit = vi.fn();
    act(() => root.render(
      <GameErrorBoundary gameTitle="Broken" onExit={onExit}>
        <BrokenGame />
      </GameErrorBoundary>,
    ));

    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "Broken",
    );
    act(() => button("Все игры").click());
    expect(onExit).toHaveBeenCalledOnce();
  });

  it("contains a rejected lazy game module", async () => {
    const LazyBrokenGame = lazy(async () => {
      throw new Error("chunk failed");
    });

    await act(async () => root.render(
      <GameErrorBoundary gameTitle="Lazy" onExit={vi.fn()}>
        <Suspense fallback={<p>Загрузка</p>}>
          <LazyBrokenGame />
        </Suspense>
      </GameErrorBoundary>,
    ));

    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "Lazy",
    );
  });
});

function BrokenGame(): never {
  throw new Error("render failed");
}

function button(label: string): HTMLButtonElement {
  const found = [...container.querySelectorAll("button")]
    .find((candidate) => candidate.textContent === label);
  if (!found) throw new Error(`Button not found: ${label}`);
  return found;
}
