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
    act(() => root.render(
      <ActiveRoundScreen
        session={session}
        onExit={onExit}
        onMark={vi.fn()}
        onExpire={vi.fn()}
      />,
    ));

    act(() => findButton("Прервать игру").click());
    expect(document.querySelector('[role="dialog"]')?.textContent)
      .toContain("Текущая партия завершится");

    act(() => findButton("Да, прервать игру").click());
    expect(onExit).toHaveBeenCalledOnce();
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
