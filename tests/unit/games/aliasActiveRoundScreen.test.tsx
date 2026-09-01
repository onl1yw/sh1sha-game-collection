/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ActiveRoundScreen } from "../../../src/games/alias/features/round/ActiveRoundScreen";
import type { AliasSession } from "../../../src/games/alias/domain/types";

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
});

describe("Alias active round screen", () => {
  it("lets the host confirm leaving an active timed round", () => {
    const onExit = vi.fn();
    const onOpenSettings = vi.fn();
    act(() => root.render(
      <ActiveRoundScreen
        session={session}
        paused={false}
        onExit={onExit}
        onOpenSettings={onOpenSettings}
        onMark={vi.fn()}
        onExpire={vi.fn()}
      />,
    ));

    act(() => document.querySelector<HTMLButtonElement>(
      'button[aria-label="Настройки"]',
    )?.click());
    expect(onOpenSettings).toHaveBeenCalledOnce();

    act(() => findButton("Прервать игру").click());
    expect(document.querySelector('[role="dialog"]')?.textContent)
      .toContain("Текущая партия завершится");

    act(() => findButton("Да, прервать игру").click());
    expect(onExit).toHaveBeenCalledOnce();
  });

  it("pauses the round countdown while the host overlay is open", () => {
    const onExpire = vi.fn();
    act(() => root.render(
      <ActiveRoundScreen
        session={session}
        paused={false}
        onExit={vi.fn()}
        onOpenSettings={vi.fn()}
        onMark={vi.fn()}
        onExpire={onExpire}
      />,
    ));

    act(() => vi.advanceTimersByTime(1_200));
    expect(container.querySelector("h1")?.textContent).toBe("0:59");

    act(() => root.render(
      <ActiveRoundScreen
        session={session}
        paused
        onExit={vi.fn()}
        onOpenSettings={vi.fn()}
        onMark={vi.fn()}
        onExpire={onExpire}
      />,
    ));
    act(() => vi.advanceTimersByTime(70_000));
    expect(onExpire).not.toHaveBeenCalled();
    expect(container.querySelector("h1")?.textContent).toBe("0:59");

    act(() => root.render(
      <ActiveRoundScreen
        session={session}
        paused={false}
        onExit={vi.fn()}
        onOpenSettings={vi.fn()}
        onMark={vi.fn()}
        onExpire={onExpire}
      />,
    ));
    act(() => vi.advanceTimersByTime(60_200));
    expect(onExpire).toHaveBeenCalledOnce();
  });

  it("pauses the round countdown while exit confirmation is open", () => {
    const onExpire = vi.fn();
    act(() => root.render(
      <ActiveRoundScreen
        session={session}
        paused={false}
        onExit={vi.fn()}
        onOpenSettings={vi.fn()}
        onMark={vi.fn()}
        onExpire={onExpire}
      />,
    ));

    act(() => findButton("Прервать игру").click());
    act(() => vi.advanceTimersByTime(70_000));
    expect(onExpire).not.toHaveBeenCalled();

    act(() => findButton("Продолжить игру").click());
    act(() => vi.advanceTimersByTime(60_200));
    expect(onExpire).toHaveBeenCalledOnce();
  });
});

const session: AliasSession = {
  setup: {
    teams: [{ id: "team-1", name: "Команда 1" }],
    selectedThemeIds: ["cinema"],
    durationSeconds: 60,
    penalizeSkips: false,
    winCondition: { type: "points", target: 30 },
  },
  scores: { "team-1": 0 },
  roundsPlayed: { "team-1": 0 },
  activeTeamIndex: 0,
  roundNumber: 1,
  deck: [{ id: "word-1", text: "Комедия", themeId: "cinema" }],
  cursor: 0,
};

function findButton(label: string): HTMLButtonElement {
  const button = Array.from(document.querySelectorAll("button"))
    .find((candidate) => candidate.textContent?.includes(label));
  if (!button) throw new Error(`Missing button: ${label}`);
  return button;
}
