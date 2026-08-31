/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DawnScreen,
  type RevealedPlayer,
} from "../../../src/games/mafia/features/day/DawnScreen";

let container: HTMLDivElement;
let root: Root;
const onContinue = vi.fn();
const onCancel = vi.fn();

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
});

describe("DawnScreen", () => {
  it("shows a no-death dawn in the shared reveal card", () => {
    renderScreen([]);

    expect(statusText()).toContain("Никто не выбыл");
    expect(container.querySelector(".lucide-sunrise")).not.toBeNull();
    expect(buttonByText("Продолжить").disabled).toBe(false);
  });

  it("does not invent a role when death reveal is disabled", () => {
    renderScreen([{ id: "p1", name: "Игрок 1" }]);

    expect(statusText()).toContain("Игрок 1");
    expect(statusText()).not.toContain("Мирный житель");
    expect(buttonByText("Продолжить").disabled).toBe(false);
  });

  it("requires each of two public roles to be revealed in sequence", () => {
    vi.useFakeTimers();
    renderScreen([
      { id: "p1", name: "Игрок 1", roleName: "Мафия", role: "mafia" },
      { id: "p2", name: "Игрок 2", roleName: "Доктор", role: "doctor" },
    ]);

    const nextDeath = buttonByText("Следующий выбывший");
    expect(nextDeath.disabled).toBe(true);
    expect(statusText()).toBe("");
    expect(container.textContent).not.toContain("Доктор");

    act(() => buttonByText("Вскрыть роль").click());
    expect(nextDeath.disabled).toBe(true);
    expect(statusText()).toContain("Мафия");
    act(() => vi.advanceTimersByTime(500));
    expect(nextDeath.disabled).toBe(false);

    act(() => nextDeath.click());
    expect(onContinue).not.toHaveBeenCalled();
    expect(buttonByText("Продолжить").disabled).toBe(true);
    expect(statusText()).toBe("");

    act(() => buttonByText("Вскрыть роль").click());
    expect(statusText()).toContain("Доктор");
    act(() => vi.advanceTimersByTime(500));
    act(() => buttonByText("Продолжить").click());
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("requires confirmation before leaving the game", () => {
    renderScreen([]);

    act(() => buttonByText("Прервать игру").click());
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    expect(onCancel).not.toHaveBeenCalled();
    act(() => buttonByText("Да, прервать игру").click());
    expect(onCancel).toHaveBeenCalledOnce();
  });
});

function renderScreen(deaths: readonly RevealedPlayer[]): void {
  act(() => root.render(
    <DawnScreen
      nightNumber={1}
      deaths={deaths}
      onCancel={onCancel}
      onOpenSettings={vi.fn()}
      onContinue={onContinue}
    />,
  ));
}

function statusText(): string {
  return container.querySelector('[role="status"]')?.textContent ?? "";
}

function buttonByText(text: string): HTMLButtonElement {
  const button = Array.from(document.querySelectorAll("button")).find(
    (candidate) => candidate.textContent?.includes(text),
  );
  if (!button) throw new Error(`Missing button: ${text}`);
  return button;
}
