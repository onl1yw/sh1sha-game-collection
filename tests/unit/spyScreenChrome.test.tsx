/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GameSetupScreen } from "../../src/games/spy/features/game-setup/GameSetupScreen";
import { ActiveRoundScreen } from "../../src/games/spy/features/round/ActiveRoundScreen";
import { RoundReadyScreen } from "../../src/games/spy/features/round/RoundReadyScreen";

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

describe("Spy screen chrome", () => {
  it("keeps sticky chrome and Settings across setup and play", () => {
    const onOpenSettings = vi.fn();
    act(() => root.render(
      <GameSetupScreen
        themeName="Политики"
        players={[
          { id: "1", name: "Игрок 1" },
          { id: "2", name: "Игрок 2" },
          { id: "3", name: "Игрок 3" },
        ]}
        spyCount={1}
        spyMode="classic"
        onPlayerCountChange={vi.fn()}
        onPlayerNameChange={vi.fn()}
        onSpyCountChange={vi.fn()}
        onSpyModeChange={vi.fn()}
        onBack={vi.fn()}
        onOpenSettings={onOpenSettings}
        onStart={vi.fn()}
      />,
    ));
    expectHeaderChrome("Политики", "Назад");
    act(() => settingsButton().click());

    act(() => root.render(
      <RoundReadyScreen
        firstPlayerName="Игрок 1"
        themeName="Политики"
        onCancel={vi.fn()}
        onOpenSettings={onOpenSettings}
        onStart={vi.fn()}
      />,
    ));
    expectHeaderChrome("Роли розданы", "Прервать игру");
    act(() => settingsButton().click());

    act(() => root.render(
      <ActiveRoundScreen
        firstPlayerName="Игрок 1"
        themeName="Политики"
        onCancel={vi.fn()}
        onOpenSettings={onOpenSettings}
        onFinishRound={vi.fn()}
      />,
    ));
    expectHeaderChrome("Ищите шпиона", "Прервать игру");
    act(() => settingsButton().click());

    expect(onOpenSettings).toHaveBeenCalledTimes(3);
  });
});

function expectHeaderChrome(title: string, leadingCopy: string): void {
  const appBar = container.querySelector('[data-ui="app-bar"]');
  expect(appBar?.querySelector("h1")?.textContent).toBe(title);
  expect(appBar?.textContent).toContain(leadingCopy);
  expect(settingsButton()).not.toBeNull();
}

function settingsButton(): HTMLButtonElement {
  const button = container.querySelector<HTMLButtonElement>(
    'button[aria-label="Настройки"]',
  );
  if (!button) throw new Error("Missing Settings button");
  return button;
}
