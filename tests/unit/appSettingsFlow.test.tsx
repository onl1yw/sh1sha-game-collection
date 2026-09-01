/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "../../src/app/App";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  localStorage.clear();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(<App />));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  localStorage.clear();
  vi.restoreAllMocks();
  setWindowScroll(0, 0);
});

describe("application settings flow", () => {
  it("reveals gated games only after sensitive content is enabled", () => {
    expect(optionalButtonByText("Шляпа")).toBeUndefined();

    act(() => buttonByText("Настройки").click());
    act(() => buttonByLabel("Показывать чувствительные темы").click());

    const settingsBack = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Назад"),
    );
    if (!settingsBack) throw new Error("Missing settings back button");
    act(() => settingsBack.click());

    expect(optionalButtonByText("Шляпа")).toBeDefined();
  });

  it("keeps an active game's in-memory setup mounted", async () => {
    const mafiaCard = buttonByText("Мафия");
    await act(async () => {
      mafiaCard.click();
      await import("../../src/games/mafia/MafiaGame");
    });
    expect(container.querySelector("h1")?.textContent).toBe("Мафия");

    act(() => buttonByLabel("Увеличить: Участников").click());
    expect(participantValue()).toBe("8");

    act(() => buttonByLabel("Настройки").click());
    expect(Array.from(container.querySelectorAll("h1")).some(
      (heading) => heading.textContent === "Настройки",
    )).toBe(true);

    const backButtons = Array.from(container.querySelectorAll("button")).filter(
      (button) => button.textContent?.includes("Назад"),
    );
    const settingsBack = backButtons.at(-1);
    if (!settingsBack) throw new Error("Missing settings back button");
    act(() => settingsBack.click());
    expect(participantValue()).toBe("8");
  });

  it("restores the settings trigger and exact scroll position", () => {
    const settingsTrigger = buttonByText("Настройки");
    settingsTrigger.focus();
    setWindowScroll(12, 240);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation((x, y) => {
      if (typeof x === "number" && typeof y === "number") {
        setWindowScroll(x, y);
      }
    });

    act(() => settingsTrigger.click());
    expect(container.querySelector('main[aria-label="Настройки коллекции"]'))
      .not.toBeNull();
    setWindowScroll(0, 0);

    const settingsBack = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Назад"),
    );
    if (!settingsBack) throw new Error("Missing settings back button");
    act(() => settingsBack.click());

    expect(document.activeElement).toBe(settingsTrigger);
    expect(scrollTo).toHaveBeenCalledWith(12, 240);
    expect(window.scrollX).toBe(12);
    expect(window.scrollY).toBe(240);
  });
});

function buttonByText(text: string): HTMLButtonElement {
  const button = optionalButtonByText(text);
  if (!button) throw new Error(`Missing button: ${text}`);
  return button;
}

function optionalButtonByText(text: string): HTMLButtonElement | undefined {
  return Array.from(container.querySelectorAll("button")).find(
    (candidate) => candidate.textContent?.includes(text),
  );
}

function buttonByLabel(label: string): HTMLButtonElement {
  const button = container.querySelector<HTMLButtonElement>(
    `button[aria-label="${label}"]`,
  );
  if (!button) throw new Error(`Missing button: ${label}`);
  return button;
}

function participantValue(): string | null {
  return container.querySelector('[role="group"][aria-label="Участников"] output')
    ?.textContent ?? null;
}

function setWindowScroll(x: number, y: number): void {
  Object.defineProperties(window, {
    scrollX: { configurable: true, value: x },
    scrollY: { configurable: true, value: y },
  });
}
