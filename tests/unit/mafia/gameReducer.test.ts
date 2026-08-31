import { describe, expect, it } from "vitest";

import type { MafiaGameAction } from "../../../src/games/mafia/app/state/gameActions";
import type { MafiaGamePhase } from "../../../src/games/mafia/app/state/gamePhase";
import { mafiaGameReducer } from "../../../src/games/mafia/app/state/gameReducer";
import {
  createInitialGameState,
  createPlayers,
  type MafiaGameState,
} from "../../../src/games/mafia/app/state/gameState";
import { getDefaultRoleSetup, teamForRole } from "../../../src/games/mafia/domain/roleSetup";
import type { MafiaRole, RoleAssignment } from "../../../src/games/mafia/domain/types";

const STANDARD_ROLES: readonly MafiaRole[] = [
  "mafia",
  "mafia",
  "commissioner",
  "doctor",
  "civilian",
  "civilian",
  "civilian",
];

describe("mafiaGameReducer", () => {
  it("moves a legal deal through every private handoff", () => {
    let state = deal(STANDARD_ROLES);
    expect(phase(state, "deal-cover").playerIndex).toBe(0);

    state = reduce(state, { type: "reveal-role" });
    expect(phase(state, "deal-role").playerIndex).toBe(0);
    state = reduce(state, { type: "hide-role" });
    expect(phase(state, "deal-cover").playerIndex).toBe(1);

    for (let playerIndex = 1; playerIndex < STANDARD_ROLES.length; playerIndex += 1) {
      state = reduce(state, { type: "reveal-role" });
      expect(phase(state, "deal-role").playerIndex).toBe(playerIndex);
      state = reduce(state, { type: "hide-role" });
    }

    expect(phase(state, "night-cover").nightNumber).toBe(1);
    expect(state.alivePlayerIds).toEqual(state.players.map((player) => player.id));
  });

  it("grows a five-player setup for a Host and excludes that role from play", () => {
    let state = createInitialGameState();
    state = reduce(state, { type: "set-player-count", count: 5 });
    state = reduce(state, { type: "set-host-by-lot", enabled: true });

    expect(state.players).toHaveLength(6);
    expect(state.roleSetup).toMatchObject({ playerCount: 6, hostByLot: true });

    const roles: readonly MafiaRole[] = [
      "host",
      "mafia",
      "commissioner",
      "civilian",
      "civilian",
      "civilian",
    ];
    state = reduce(state, {
      type: "roles-dealt",
      assignments: assignmentsFor(roles),
      playerNames: new Map(state.players.map((player) => [player.id, player.name])),
    });

    expect(state.alivePlayerIds).toEqual([
      "player-2",
      "player-3",
      "player-4",
      "player-5",
      "player-6",
    ]);
  });

  it("runs the first night with feedback and Doctor protection", () => {
    let state = finishDeal(deal(STANDARD_ROLES));
    state = reduce(state, { type: "start-night" });
    const countdown = phase(state, "night-transition");
    expect(countdown.nextStepIndex).toBe(0);
    expect(countdown.delayMs).toBe(3000);
    state = reduce(state, { type: "continue-night" });
    expect(currentStep(state)).toBe("mafia-kill");
    state = reduce(state, { type: "finish-night-step" });
    expect(currentStep(state)).toBe("mafia-kill");

    state = chooseAndConfirm(state, "player-6");
    expect(phase(state, "night-transition").nextStepIndex).toBe(1);
    state = reduce(state, { type: "continue-night" });
    expect(currentStep(state)).toBe("commissioner-check");

    state = chooseAndConfirm(state, "player-1");
    const feedback = phase(state, "night-feedback");
    expect(feedback.result).toEqual({
      kind: "commissioner-check",
      targetPlayerId: "player-1",
      positive: true,
    });
    state = reduce(state, { type: "finish-night-step" });
    state = reduce(state, { type: "continue-night" });
    expect(currentStep(state)).toBe("doctor-protect");

    state = chooseAndConfirm(state, "player-6");
    state = reduce(state, { type: "continue-night" });
    const dawn = phase(state, "dawn");
    expect(dawn.nightNumber).toBe(1);
    expect(dawn.eliminatedPlayerIds).toEqual([]);
    expect(dawn.pendingWinner).toBeNull();
    expect(state.alivePlayerIds).toHaveLength(7);
  });

  it("eliminates the voted player and publishes the winner", () => {
    let state = stateForRoles([
      "mafia",
      "commissioner",
      "civilian",
      "civilian",
      "civilian",
    ]);
    state = { ...state, phase: { kind: "discussion", dayNumber: 1 } };

    state = reduce(state, { type: "start-vote" });
    state = reduce(state, { type: "select-vote-target", playerId: "player-1" });
    state = reduce(state, { type: "confirm-vote" });

    const elimination = phase(state, "elimination");
    expect(elimination.playerId).toBe("player-1");
    expect(elimination.pendingWinner).toBe("town");
    expect(state.alivePlayerIds).not.toContain("player-1");

    state = reduce(state, { type: "continue-elimination" });
    expect(phase(state, "results").winner).toBe("town");
  });

  it("keeps a dead hidden role as a dummy night step", () => {
    let state = stateForRoles(STANDARD_ROLES);
    state = {
      ...state,
      roleSetup: { ...state.roleSetup, deathReveal: "never" },
      alivePlayerIds: state.alivePlayerIds.filter((id) => id !== "player-4"),
      phase: { kind: "night-cover", nightNumber: 2 },
    };

    state = reduce(state, { type: "start-night" });
    const countdown = phase(state, "night-transition");
    const doctorIndex = countdown.plan.findIndex((step) => step.kind === "doctor-protect");
    const doctorStep = countdown.plan[doctorIndex];

    expect(doctorStep).toEqual({
      kind: "doctor-protect",
      actorPlayerIds: [],
      isDummy: true,
    });

    state = {
      ...state,
      phase: {
        kind: "night-step",
        nightNumber: 2,
        plan: countdown.plan,
        stepIndex: doctorIndex,
        actions: { "mafia-kill": "player-5" },
        selectedPlayerId: null,
      },
    };
    state = reduce(state, { type: "finish-night-step" });
    const transition = phase(state, "night-transition");
    expect(transition.nextStepIndex).toBe(doctorIndex + 1);
    expect(transition.actions).toEqual({ "mafia-kill": "player-5" });
  });

  it("ends in a draw when Mafia and Maniac eliminate each other", () => {
    let state = stateForRoles([
      "mafia",
      "maniac",
      "civilian",
      "civilian",
      "civilian",
    ]);
    state = {
      ...state,
      alivePlayerIds: ["player-1", "player-2"],
      phase: {
        kind: "night-transition",
        nightNumber: 2,
        plan: [
          { kind: "mafia-kill", actorPlayerIds: ["player-1"], isDummy: false },
          { kind: "maniac-kill", actorPlayerIds: ["player-2"], isDummy: false },
        ],
        nextStepIndex: 2,
        actions: {
          "mafia-kill": "player-2",
          "maniac-kill": "player-1",
        },
        message: "Маньяк закрывает глаза",
        delayMs: 3000,
      },
    };

    state = reduce(state, { type: "continue-night" });
    const dawn = phase(state, "dawn");
    expect(dawn.eliminatedPlayerIds).toEqual(["player-2", "player-1"]);
    expect(dawn.pendingWinner).toBe("draw");
    expect(state.alivePlayerIds).toEqual([]);
  });
});

function deal(roles: readonly MafiaRole[]): MafiaGameState {
  const state = stateForRoles(roles);
  return reduce(
    { ...state, assignments: [], alivePlayerIds: [], phase: { kind: "setup" } },
    {
      type: "roles-dealt",
      assignments: assignmentsFor(roles),
      playerNames: new Map(state.players.map((player) => [player.id, player.name])),
    },
  );
}

function finishDeal(initial: MafiaGameState): MafiaGameState {
  let state = initial;
  for (let index = 0; index < state.players.length; index += 1) {
    state = reduce(state, { type: "reveal-role" });
    state = reduce(state, { type: "hide-role" });
  }
  return state;
}

function chooseAndConfirm(state: MafiaGameState, playerId: string): MafiaGameState {
  return reduce(
    reduce(state, { type: "select-night-target", playerId }),
    { type: "confirm-night-action" },
  );
}

function stateForRoles(roles: readonly MafiaRole[]): MafiaGameState {
  const players = createPlayers(roles.length);
  return {
    ...createInitialGameState(),
    players,
    roleSetup: getDefaultRoleSetup(roles.length),
    assignments: assignmentsFor(roles),
    alivePlayerIds: players.map((player) => player.id),
  };
}

function assignmentsFor(roles: readonly MafiaRole[]): RoleAssignment[] {
  return roles.map((role, index) => ({
    playerId: `player-${index + 1}`,
    role,
    team: teamForRole(role),
  }));
}

function reduce(state: MafiaGameState, action: MafiaGameAction): MafiaGameState {
  return mafiaGameReducer(state, action);
}

function currentStep(state: MafiaGameState): string | undefined {
  return phase(state, "night-step").plan[phase(state, "night-step").stepIndex]?.kind;
}

function phase<Kind extends MafiaGamePhase["kind"]>(
  state: MafiaGameState,
  kind: Kind,
): Extract<MafiaGamePhase, { kind: Kind }> {
  if (state.phase.kind !== kind) {
    throw new Error(`Expected phase ${kind}, received ${state.phase.kind}`);
  }
  return state.phase as Extract<MafiaGamePhase, { kind: Kind }>;
}
