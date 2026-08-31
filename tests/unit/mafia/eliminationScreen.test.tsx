/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EliminationScreen } from "../../../src/games/mafia/features/day/EliminationScreen";

let container: HTMLDivElement;
let root: Root;

const callbacks = {
  onCancel: vi.fn(),
  onOpenSettings: vi.fn(),
  onContinue: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
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

describe("EliminationScreen", () => {
  it("keeps a revealed role secret and Continue disabled until the card flips", () => {
    vi.useFakeTimers();
    renderScreen({ name: "Игрок 1", roleName: "Мафия", role: "mafia" });
    const next = buttonByText("Начать ночь");

    expect(container.querySelector('[role="status"]')?.textContent).toBe("");
    expect(container.querySelector(".lucide-cigarette")).toBeNull();
    expect(next.disabled).toBe(true);

    act(() => buttonByText("Вскрыть роль").click());
    expect(next.disabled).toBe(true);
    expect(container.querySelector('[role="status"]')?.textContent).toContain("Игрок 1");
    expect(container.querySelector('[role="status"]')?.textContent).toContain("Мафия");
    expect(container.querySelector(".lucide-cigarette")).not.toBeNull();

    act(() => vi.advanceTimersByTime(500));
    expect(next.disabled).toBe(false);
    expect(document.activeElement).toBe(next);
  });

  it("shows a no-role result immediately when death reveal is disabled", () => {
    renderScreen({ name: "Игрок 2" });
    const status = container.querySelector<HTMLElement>('[role="status"]');

    expect(status?.textContent).toContain("Игрок 2");
    expect(status?.textContent).not.toContain("Мафия");
    expect(status?.querySelector(".lucide-gavel")).not.toBeNull();
    expect(buttonByText("Начать ночь").disabled).toBe(false);
    expect(buttonByText("Прервать игру")).not.toBeNull();
  });

  it("removes the flip lock for reduced motion", () => {
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    renderScreen({ name: "Игрок 3", roleName: "Доктор", role: "doctor" });

    act(() => buttonByText("Вскрыть роль").click());
    act(() => vi.advanceTimersByTime(0));

    expect(buttonByText("Начать ночь").disabled).toBe(false);
    expect(container.querySelector('[role="status"]')?.getAttribute("data-tone"))
      .toBe("accent");
  });
});

function renderScreen(
  player:
    | { name: string }
    | { name: string; roleName: string; role: "mafia" | "doctor" },
): void {
  act(() => root.render(
    <EliminationScreen
      {...callbacks}
      dayNumber={1}
      player={player}
      nextLabel="Начать ночь"
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
