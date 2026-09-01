import { describe, expect, it } from "vitest";

import { aliasGameReducer } from "../../../src/games/alias/app/state/gameReducer";
import { createInitialSetup } from "../../../src/games/alias/domain/setup";
import type { AliasGameState, AliasWord } from "../../../src/games/alias/domain/types";

const deck: AliasWord[] = [
  { id: "one", text: "Первое", themeId: "cinema" },
  { id: "two", text: "Второе", themeId: "cinema" },
  { id: "three", text: "Третье", themeId: "cinema" },
];

describe("Alias reducer", () => {
  it("rotates teams and finishes after every team plays the configured rounds", () => {
    let state: AliasGameState = {
      phase: "setup",
      setup: {
        ...createInitialSetup(["cinema"]),
        winCondition: { type: "rounds", roundsPerTeam: 1 },
      },
    };
    state = aliasGameReducer(state, { type: "start-game", deck });
    state = playOneCorrectRound(state);
    expect(state.phase).toBe("ready");
    if (state.phase !== "ready") return;
    expect(state.session.activeTeamIndex).toBe(1);
    expect(state.session.scores["team-1"]).toBe(1);

    state = playOneCorrectRound(state);
    expect(state.phase).toBe("results");
    if (state.phase !== "results") return;
    expect(state.session.scores).toEqual({ "team-1": 1, "team-2": 1 });
  });

  it("lets players correct a result before scoring", () => {
    let state: AliasGameState = {
      phase: "setup",
      setup: {
        ...createInitialSetup(["cinema"]),
        teams: [{ id: "team-1", name: "Одна команда" }],
        penalizeSkips: true,
        winCondition: { type: "points", target: 1 },
      },
    };
    state = aliasGameReducer(state, { type: "start-game", deck });
    state = aliasGameReducer(state, { type: "start-round" });
    state = aliasGameReducer(state, { type: "record-word", outcome: "skipped" });
    state = aliasGameReducer(state, { type: "finish-round" });
    if (state.phase !== "review") throw new Error("Expected review");
    state = aliasGameReducer(state, { type: "toggle-result", entryId: state.entries[0]?.id ?? "" });
    state = aliasGameReducer(state, { type: "confirm-review" });
    expect(state.phase).toBe("results");
    if (state.phase === "results") expect(state.session.scores["team-1"]).toBe(1);
  });

  it("replaces an exhausted deck before the next word", () => {
    const replacement = [{ id: "next", text: "Новое", themeId: "cinema" }];
    let state: AliasGameState = {
      phase: "round",
      session: {
        setup: createInitialSetup(["cinema"]),
        deck: [deck[0] as AliasWord],
        cursor: 0,
        scores: { "team-1": 0, "team-2": 0 },
        roundsPlayed: { "team-1": 0, "team-2": 0 },
        activeTeamIndex: 0,
        roundNumber: 1,
      },
      entries: [],
    };

    state = aliasGameReducer(state, {
      type: "record-word",
      outcome: "correct",
      nextDeck: replacement,
    });
    expect(state.phase).toBe("round");
    if (state.phase === "round") {
      expect(state.session.deck).toEqual(replacement);
      expect(state.session.cursor).toBe(0);
      expect(state.entries[0]?.word.id).toBe("one");
    }
  });
});

function playOneCorrectRound(state: AliasGameState): AliasGameState {
  state = aliasGameReducer(state, { type: "start-round" });
  state = aliasGameReducer(state, { type: "record-word", outcome: "correct" });
  state = aliasGameReducer(state, { type: "finish-round" });
  return aliasGameReducer(state, { type: "confirm-review" });
}
