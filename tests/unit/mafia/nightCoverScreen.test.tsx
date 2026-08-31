/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NightCoverScreen } from "../../../src/games/mafia/features/night/NightCoverScreen";

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

describe("NightCoverScreen", () => {
  it("starts only while spoken guidance is enabled and available", () => {
    const onStart = vi.fn();
    renderCover({ narrationAvailable: true, soundEnabled: true, onStart });
    const start = buttonByText("Начать ночь");

    expect(start.disabled).toBe(false);
    expect(buttonByText("Прервать игру").querySelector(".lucide-log-out"))
      .not.toBeNull();
    act(() => start.click());
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("blocks a muted night and tells the user how to recover", () => {
    renderCover({ narrationAvailable: true, soundEnabled: false });

    expect(buttonByText("Начать ночь").disabled).toBe(true);
    expect(container.querySelector('[role="alert"]')?.textContent)
      .toContain("Включите звук");
  });

  it("blocks an unsupported browser even when sound is enabled", () => {
    renderCover({ narrationAvailable: false, soundEnabled: true });

    expect(buttonByText("Начать ночь").disabled).toBe(true);
    expect(container.querySelector('[role="alert"]')?.textContent)
      .toContain("Озвучка недоступна");
  });

  it("allows a selected human host to run a silent night", () => {
    renderCover({ narrationAvailable: false, soundEnabled: false, hostByLot: true });

    expect(buttonByText("Начать ночь").disabled).toBe(false);
    expect(container.textContent).toContain("Все, кроме ведущего");
    expect(container.textContent).toContain("Ведущий вызывает роли");
  });
});

interface CoverOverrides {
  narrationAvailable: boolean;
  soundEnabled: boolean;
  hostByLot?: boolean;
  onStart?: () => void;
}

function renderCover(overrides: CoverOverrides): void {
  act(() => root.render(
    <NightCoverScreen
      nightNumber={1}
      hostByLot={overrides.hostByLot ?? false}
      narrationAvailable={overrides.narrationAvailable}
      soundEnabled={overrides.soundEnabled}
      onCancel={vi.fn()}
      onOpenSettings={vi.fn()}
      onStart={overrides.onStart ?? vi.fn()}
    />,
  ));
}

function buttonByText(text: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll("button")).find(
    (candidate) => candidate.textContent?.includes(text),
  );
  if (!button) throw new Error(`Missing button: ${text}`);
  return button;
}
