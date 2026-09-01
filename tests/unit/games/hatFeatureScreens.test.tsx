/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HatScreenRouter } from "../../../src/games/hat/app/HatScreenRouter";
import type { HatTheme } from "../../../src/games/hat/domain/theme";
import type { HatSession, HatSetup, HatTeam, TurnDraft } from "../../../src/games/hat/domain/types";
import { HatResultsScreen } from "../../../src/games/hat/features/results/HatResultsScreen";
import { TurnReviewScreen } from "../../../src/games/hat/features/review/TurnReviewScreen";
import { HatSetupScreen } from "../../../src/games/hat/features/setup/HatSetupScreen";
import { StageCompleteScreen } from "../../../src/games/hat/features/stage/StageCompleteScreen";
import { TurnReadyScreen } from "../../../src/games/hat/features/turn/TurnReadyScreen";

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

describe("Hat feature screens", () => {
  it.each(["loading", "ready"] as const)(
    "keeps exit and settings available while the catalog is %s",
    (catalogStatus) => {
      const onExit = vi.fn();
      const onOpenSettings = vi.fn();
      act(() => root.render(
        <HatScreenRouter
          state={{ phase: "setup", setup }}
          dispatch={vi.fn()}
          themes={[]}
          catalogStatus={catalogStatus}
          catalogWarnings={[]}
          paused={false}
          onExit={onExit}
          onOpenSettings={onOpenSettings}
        />,
      ));

      act(() => findButton("Назад").click());
      const settings = container.querySelector<HTMLButtonElement>(
        'button[aria-label="Настройки"]',
      );
      act(() => settings?.click());
      expect(onExit).toHaveBeenCalledOnce();
      expect(onOpenSettings).toHaveBeenCalledOnce();
    },
  );

  it("uses shared team and preset controls on setup", () => {
    const onWordCountChange = vi.fn();
    const onStart = vi.fn();
    act(() => root.render(
      <HatSetupScreen
        setup={setup}
        themes={themes}
        availableWordCount={80}
        catalogWarnings={[]}
        canStart
        onBack={vi.fn()}
        onOpenSettings={vi.fn()}
        onTeamsChange={vi.fn()}
        onTeamRename={vi.fn()}
        onThemeToggle={vi.fn()}
        onWordCountChange={onWordCountChange}
        onDurationChange={vi.fn()}
        onStart={onStart}
      />,
    ));

    expect(container.querySelector("h1")?.textContent).toBe("Шляпа");
    expect(container.textContent).toContain("Названия команд");
    act(() => findButton("50 слов").click());
    expect(onWordCountChange).toHaveBeenCalledWith(50);
    act(() => findButton("Начать игру").click());
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("names stages separately from unlimited team turns", () => {
    act(() => root.render(
      <TurnReadyScreen
        session={session}
        onExit={vi.fn()}
        onOpenSettings={vi.fn()}
        onReady={vi.fn()}
      />,
    ));

    expect(container.textContent).toContain("Этап 1 из 3");
    expect(container.querySelector("h1")?.textContent).toBe("Команда 1");
    expect(container.textContent).toContain("Объясняйте словами");
  });

  it("reviews only correct claims and toggles by word id", () => {
    const onToggle = vi.fn();
    act(() => root.render(
      <TurnReviewScreen
        session={session}
        draft={draft}
        onToggle={onToggle}
        onConfirm={vi.fn()}
        onExit={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    ));

    expect(container.textContent).toContain("Комедия");
    expect(container.textContent).not.toContain("Трейлер");
    act(() => container.querySelector<HTMLButtonElement>('[role="switch"]')?.click());
    expect(onToggle).toHaveBeenCalledWith("word-1");
  });

  it("offers both leftover-time choices after a stage", () => {
    const onContinueNow = vi.fn();
    const onCarryTime = vi.fn();
    act(() => root.render(
      <StageCompleteScreen
        session={session}
        remainingMs={5_200}
        onContinueNow={onContinueNow}
        onCarryTime={onCarryTime}
        onExit={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    ));

    expect(container.querySelector("h1")?.textContent).toBe("Стопка закончилась");
    act(() => findButton("Играть дальше").click());
    act(() => findButton("Сохранить 0:06").click());
    expect(onContinueNow).toHaveBeenCalledOnce();
    expect(onCarryTime).toHaveBeenCalledOnce();
  });

  it("describes carried time without another team in solo play", () => {
    act(() => root.render(
      <StageCompleteScreen
        session={sessionFor([{ id: "solo", name: "Одна команда" }])}
        remainingMs={5_200}
        onContinueNow={vi.fn()}
        onCarryTime={vi.fn()}
        onExit={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    ));

    expect(container.textContent).toContain(
      "Остаток добавится к полному следующему ходу",
    );
    expect(container.textContent).not.toContain("другая команда");
  });

  it("emphasizes turns and active time for one team", () => {
    const solo = sessionFor([{ id: "solo", name: "Одна команда" }]);
    solo.turnsStarted.solo = 4;
    solo.activePlayMs = { describe: 31_000, gestures: 22_000, "one-word": 17_000 };
    act(() => root.render(
      <HatResultsScreen
        session={solo}
        onPlayAgain={vi.fn()}
        onExit={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    ));

    expect(container.querySelector("h1")?.textContent).toBe("Все три этапа пройдены");
    expect(container.textContent).toContain("Ходов4");
    expect(container.textContent).toContain("Игровое время1:10");
  });
});

const teams: HatTeam[] = [
  { id: "team-1", name: "Команда 1" },
  { id: "team-2", name: "Команда 2" },
];

const setup: HatSetup = {
  teams,
  selectedThemeIds: ["cinema"],
  wordCount: 30,
  durationSeconds: 60,
};

const themes: HatTheme[] = [{
  schemaVersion: 1,
  id: "cinema",
  name: "Кино",
  description: "Всё вокруг экрана",
  words: Array.from({ length: 80 }, (_, index) => `Слово ${index + 1}`),
  sensitive: false,
}];

const session = sessionFor(teams);

const draft: TurnDraft = {
  teamId: "team-1",
  segmentBudgetMs: 60_000,
  queueWordIds: ["word-2"],
  correctClaims: [{ wordId: "word-1", included: true }],
  skippedAttempts: 1,
};

function sessionFor(gameTeams: HatTeam[]): HatSession {
  const values = () => Object.fromEntries(gameTeams.map((team) => [team.id, 0]));
  return {
    setup: { ...setup, teams: gameTeams },
    masterWords: [
      { id: "word-1", text: "Комедия", themeId: "cinema" },
      { id: "word-2", text: "Трейлер", themeId: "cinema" },
    ],
    stageIndex: 0,
    remainingWordIds: ["word-1", "word-2"],
    activeTeamIndex: 0,
    scores: values(),
    stageScores: {
      describe: values(),
      gestures: values(),
      "one-word": values(),
    },
    timeCreditsMs: values(),
    turnsStarted: values(),
    activePlayMs: { describe: 0, gestures: 0, "one-word": 0 },
  };
}

function findButton(label: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll("button"))
    .find((candidate) => candidate.textContent?.includes(label));
  if (!button) throw new Error(`Missing button: ${label}`);
  return button;
}
