import { describe, expect, it } from "vitest";

import { narrationForState } from "../../../src/games/mafia/app/narration";
import { createInitialGameState } from "../../../src/games/mafia/app/state/gameState";

describe("Mafia narration", () => {
  it("waits for explicit night start before calling the first role", () => {
    const initial = createInitialGameState();
    const nightCover = {
      ...initial,
      phase: { kind: "night-cover" as const, nightNumber: 1 },
    };
    const firstStep = {
      ...initial,
      phase: {
        kind: "night-step" as const,
        nightNumber: 1,
        plan: [{
          kind: "mafia-kill" as const,
          actorPlayerIds: ["player-1"],
          isDummy: false,
        }],
        stepIndex: 0,
        actions: {},
        selectedPlayerId: null,
      },
    };

    expect(narrationForState(nightCover)).toBeNull();
    expect(narrationForState(firstStep)).toMatchObject({
      clipId: "mafia-wakes",
      text: expect.stringMatching(/^Просыпается мафия/),
    });
  });

  it("narrates the configured Lover mode", () => {
    const initial = createInitialGameState();
    const state = {
      ...initial,
      roleSetup: { ...initial.roleSetup, lover: 1 as const, loverMode: "block-vote" as const },
      phase: {
        kind: "night-step" as const,
        nightNumber: 1,
        plan: [{
          kind: "lover-visit" as const,
          actorPlayerIds: ["player-1"],
          isDummy: false,
        }],
        stepIndex: 0,
        actions: {},
        selectedPlayerId: null,
      },
    };

    expect(narrationForState(state)).toMatchObject({
      clipId: "lover-blocks-vote",
      text: expect.stringContaining("не сможет голосовать днём"),
    });
  });
});
