/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { HatSession, TurnDraft } from "../../../src/games/hat/domain/types";
import { ActiveTurnScreen } from "../../../src/games/hat/features/turn/ActiveTurnScreen";

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

describe("Hat active turn screen", () => {
  it("pauses the timer while exit confirmation is open", () => {
    const onExpire = vi.fn();
    renderActive({ onExpire });

    act(() => vi.advanceTimersByTime(1_200));
    expect(container.querySelector("h1")?.textContent).toBe("0:09");
    act(() => findButton("Прервать игру").click());
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();

    act(() => vi.advanceTimersByTime(20_000));
    expect(onExpire).not.toHaveBeenCalled();
    expect(container.querySelector("h1")?.textContent).toBe("0:09");

    act(() => findButton("Продолжить игру").click());
    act(() => vi.advanceTimersByTime(9_200));
    expect(onExpire).toHaveBeenCalledOnce();
  });

  it("pauses controls and countdown for the host settings overlay", () => {
    const onExpire = vi.fn();
    renderActive({ paused: true, onExpire });
    act(() => vi.advanceTimersByTime(20_000));

    expect(onExpire).not.toHaveBeenCalled();
    expect(container.querySelector("h1")?.textContent).toBe("0:10");
    expect(findButton("Пропустить слово").disabled).toBe(true);
    expect(findButton("Слово угадано").disabled).toBe(true);
  });

  it("counts card-exit animation against the turn before committing", () => {
    const onCorrect = vi.fn();
    const onExpire = vi.fn();
    renderActive({ onCorrect, onExpire });

    act(() => findButton("Слово угадано").click());
    const card = container.querySelector<HTMLElement>('[role="group"]');
    expect(card?.dataset.exiting).toBe("correct");
    expect(onCorrect).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1_200));
    expect(container.querySelector("h1")?.textContent).toBe("0:09");
    expect(onExpire).not.toHaveBeenCalled();
    expect(onCorrect).not.toHaveBeenCalled();

    act(() => {
      card?.dispatchEvent(new Event("animationend", { bubbles: true }));
      card?.dispatchEvent(new Event("webkitAnimationEnd", { bubbles: true }));
    });
    expect(onCorrect).toHaveBeenCalledOnce();
    expect(onCorrect.mock.calls[0]?.[0]).toBeGreaterThan(8_000);
    expect(onCorrect.mock.calls[0]?.[0]).toBeLessThanOrEqual(9_000);
  });

  it("commits an in-flight outcome before an expiration deferred by animation", () => {
    const onCorrect = vi.fn();
    const onExpire = vi.fn();
    renderActive({ onCorrect, onExpire });

    act(() => findButton("Слово угадано").click());
    const card = container.querySelector<HTMLElement>('[role="group"]');
    act(() => vi.advanceTimersByTime(10_200));
    expect(container.querySelector("h1")?.textContent).toBe("0:00");
    expect(onExpire).not.toHaveBeenCalled();
    expect(card?.isConnected).toBe(true);
    expect(card?.dataset.exiting).toBe("correct");

    act(() => {
      card?.dispatchEvent(new Event("animationend", { bubbles: true }));
      card?.dispatchEvent(new Event("webkitAnimationEnd", { bubbles: true }));
    });
    expect(onCorrect).toHaveBeenCalledWith(0);
    expect(onExpire).toHaveBeenCalledOnce();
  });
});

function renderActive(overrides: {
  paused?: boolean;
  onCorrect?: (remainingMs: number) => void;
  onExpire?: () => void;
} = {}): void {
  act(() => root.render(
    <ActiveTurnScreen
      session={session}
      draft={draft}
      paused={overrides.paused ?? false}
      onExit={vi.fn()}
      onOpenSettings={vi.fn()}
      onCorrect={overrides.onCorrect ?? vi.fn()}
      onSkip={vi.fn()}
      onExpire={overrides.onExpire ?? vi.fn()}
    />,
  ));
}

const session: HatSession = {
  setup: {
    teams: [{ id: "team-1", name: "Команда 1" }],
    selectedThemeIds: ["cinema"],
    wordCount: 1,
    durationSeconds: 10,
  },
  masterWords: [{ id: "word-1", text: "Комедия", themeId: "cinema" }],
  stageIndex: 0,
  remainingWordIds: ["word-1"],
  activeTeamIndex: 0,
  scores: { "team-1": 0 },
  stageScores: {
    describe: { "team-1": 0 },
    gestures: { "team-1": 0 },
    "one-word": { "team-1": 0 },
  },
  timeCreditsMs: { "team-1": 0 },
  turnsStarted: { "team-1": 1 },
  activePlayMs: { describe: 0, gestures: 0, "one-word": 0 },
};

const draft: TurnDraft = {
  teamId: "team-1",
  segmentBudgetMs: 10_000,
  queueWordIds: ["word-1"],
  correctClaims: [],
  skippedAttempts: 0,
};

function findButton(label: string): HTMLButtonElement {
  const button = Array.from(document.querySelectorAll("button"))
    .find((candidate) => candidate.getAttribute("aria-label") === label
      || candidate.textContent?.includes(label));
  if (!button) throw new Error(`Missing button: ${label}`);
  return button;
}
