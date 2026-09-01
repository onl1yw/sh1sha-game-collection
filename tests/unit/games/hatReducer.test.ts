import { describe, expect, it } from "vitest";

import { hatGameReducer } from "../../../src/games/hat/app/state/gameReducer";
import {
  finalHatScoreIsComplete,
  totalHatScore,
} from "../../../src/games/hat/domain/scoring";
import { createInitialHatSetup } from "../../../src/games/hat/domain/setup";
import type {
  HatGameState,
  HatSession,
  HatSetup,
  HatWord,
} from "../../../src/games/hat/domain/types";

const words: HatWord[] = Array.from({ length: 5 }, (_, index) => ({
  id: `word-${index + 1}`,
  text: `Слово ${index + 1}`,
  themeId: "cinema",
}));
const wordIds = words.map((word) => word.id);

describe("Hat reducer", () => {
  it("commits scores only after review and rotates on timeout", () => {
    let state = startTurn(startGame());
    state = hatGameReducer(state, { type: "mark-correct", remainingMs: 9_000 });
    state = hatGameReducer(state, { type: "expire-turn" });
    expect(state.phase).toBe("review");
    expect(sessionOf(state).scores["team-1"]).toBe(0);

    state = hatGameReducer(state, {
      type: "confirm-review",
      remainingWordIds: wordIds.slice(1),
    });
    expect(state.phase).toBe("ready");
    expect(sessionOf(state).scores["team-1"]).toBe(1);
    expect(sessionOf(state).activeTeamIndex).toBe(1);
    expect(sessionOf(state).activePlayMs.describe).toBe(10_000);
  });

  it("keeps a skipped last word in play", () => {
    let state = startTurn(startGame());
    for (let index = 0; index < words.length - 1; index += 1) {
      state = hatGameReducer(state, { type: "mark-correct", remainingMs: 8_000 });
    }
    expect(state.phase).toBe("turn");
    state = hatGameReducer(state, {
      type: "skip-word",
      queueWordIds: [wordIds.at(-1) ?? ""],
    });
    expect(state.phase).toBe("turn");
    if (state.phase !== "turn") return;
    expect(state.draft.queueWordIds).toEqual([wordIds.at(-1)]);
    expect(state.draft.skippedAttempts).toBe(1);
  });

  it("returns a rejected last claim and resumes the same timed turn", () => {
    let state = completePool(startTurn(startGame()), 5_000);
    expect(state.phase).toBe("review");
    const lastId = wordIds.at(-1) ?? "";
    state = hatGameReducer(state, { type: "toggle-claim", wordId: lastId });
    state = hatGameReducer(state, {
      type: "confirm-review",
      remainingWordIds: [lastId],
    });

    expect(state.phase).toBe("turn");
    if (state.phase !== "turn") return;
    expect(state.draft.teamId).toBe("team-1");
    expect(state.draft.segmentBudgetMs).toBe(5_000);
    expect(state.session.scores["team-1"]).toBe(4);
    expect(state.session.activePlayMs.describe).toBe(5_000);
    expect(state.session.turnsStarted["team-1"]).toBe(1);

    state = hatGameReducer(state, { type: "mark-correct", remainingMs: 3_000 });
    state = hatGameReducer(state, { type: "confirm-review", remainingWordIds: [] });
    expect(state.phase).toBe("stage-choice");
    expect(sessionOf(state).scores["team-1"]).toBe(5);
    expect(sessionOf(state).activePlayMs.describe).toBe(7_000);
  });

  it("continues with leftover time or banks it for the same team's next turn", () => {
    let state = reachStageChoice(startGame(), 6_000);
    state = hatGameReducer(state, {
      type: "continue-next-stage",
      nextStageWordIds: [...wordIds].reverse(),
    });
    expect(state.phase).toBe("turn");
    if (state.phase !== "turn") return;
    expect(state.session.stageIndex).toBe(1);
    expect(state.session.activeTeamIndex).toBe(0);
    expect(state.draft.segmentBudgetMs).toBe(6_000);
    expect(state.session.turnsStarted["team-1"]).toBe(1);

    state = completePool(state, 2_000);
    state = hatGameReducer(state, { type: "confirm-review", remainingWordIds: [] });
    expect(state.phase).toBe("stage-choice");
    state = hatGameReducer(state, {
      type: "carry-stage-time",
      nextStageWordIds: wordIds,
    });
    expect(state.phase).toBe("ready");
    expect(sessionOf(state).stageIndex).toBe(2);
    expect(sessionOf(state).activeTeamIndex).toBe(1);
    expect(sessionOf(state).timeCreditsMs["team-1"]).toBe(2_000);

    state = startTurn(state);
    if (state.phase !== "turn") return;
    expect(state.draft.segmentBudgetMs).toBe(10_000);
    state = hatGameReducer(state, { type: "expire-turn" });
    state = hatGameReducer(state, {
      type: "confirm-review",
      remainingWordIds: wordIds,
    });
    state = startTurn(state);
    expect(state.phase).toBe("turn");
    if (state.phase !== "turn") return;
    expect(state.draft.teamId).toBe("team-1");
    expect(state.draft.segmentBudgetMs).toBe(12_000);
    expect(state.session.timeCreditsMs["team-1"]).toBe(0);
  });

  it("automatically advances at zero and finishes only after the third pool", () => {
    let state = completePool(startTurn(startGame()), 0);
    state = hatGameReducer(state, {
      type: "confirm-review",
      remainingWordIds: [],
      nextStageWordIds: [...wordIds].reverse(),
    });
    expect(state.phase).toBe("ready");
    expect(sessionOf(state).stageIndex).toBe(1);
    expect(sessionOf(state).activeTeamIndex).toBe(1);

    state = completePool(startTurn(state), 0);
    state = hatGameReducer(state, {
      type: "confirm-review",
      remainingWordIds: [],
      nextStageWordIds: wordIds,
    });
    expect(state.phase).toBe("ready");
    expect(sessionOf(state).stageIndex).toBe(2);
    expect(sessionOf(state).activeTeamIndex).toBe(0);

    state = completePool(startTurn(state), 5_000);
    const review = state;
    state = hatGameReducer(state, { type: "expire-turn" });
    expect(state).toBe(review);
    state = hatGameReducer(state, { type: "confirm-review", remainingWordIds: [] });
    expect(state.phase).toBe("results");
    expect(totalHatScore(sessionOf(state))).toBe(15);
    expect(finalHatScoreIsComplete(sessionOf(state))).toBe(true);
  });

  it("rotates a one-team game back to itself without limiting turns", () => {
    const setup: HatSetup = {
      ...baseSetup(),
      teams: [{ id: "solo", name: "Одна команда" }],
    };
    let state = startTurn(startGame(setup));
    state = hatGameReducer(state, { type: "expire-turn" });
    state = hatGameReducer(state, {
      type: "confirm-review",
      remainingWordIds: wordIds,
    });
    expect(state.phase).toBe("ready");
    expect(sessionOf(state).activeTeamIndex).toBe(0);
    state = startTurn(state);
    expect(sessionOf(state).turnsStarted.solo).toBe(2);
  });
});

function baseSetup(): HatSetup {
  return {
    ...createInitialHatSetup(["cinema"]),
    wordCount: words.length,
    durationSeconds: 10,
  };
}

function startGame(setup: HatSetup = baseSetup()): HatGameState {
  return hatGameReducer(
    { phase: "setup", setup },
    { type: "start-game", masterWords: words },
  );
}

function startTurn(state: HatGameState): HatGameState {
  return hatGameReducer(state, { type: "start-turn" });
}

function completePool(state: HatGameState, remainingMs: number): HatGameState {
  let next = state;
  while (next.phase === "turn") {
    next = hatGameReducer(next, { type: "mark-correct", remainingMs });
  }
  return next;
}

function reachStageChoice(state: HatGameState, remainingMs: number): HatGameState {
  const review = completePool(startTurn(state), remainingMs);
  return hatGameReducer(review, { type: "confirm-review", remainingWordIds: [] });
}

function sessionOf(state: HatGameState): HatSession {
  if (state.phase === "setup") throw new Error("Expected an active Hat session");
  return state.session;
}
