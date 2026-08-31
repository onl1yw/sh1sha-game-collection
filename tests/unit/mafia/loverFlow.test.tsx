/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MafiaGameAction } from "../../../src/games/mafia/app/state/gameActions";
import { mafiaGameReducer } from "../../../src/games/mafia/app/state/gameReducer";
import {
  createInitialGameState,
  createPlayers,
  type MafiaGameState,
} from "../../../src/games/mafia/app/state/gameState";
import { nightTargetPlayers } from "../../../src/games/mafia/app/state/selectors";
import { teamForRole } from "../../../src/games/mafia/domain/roleSetup";
import type {
  MafiaRole,
  RoleAssignment,
} from "../../../src/games/mafia/domain/types";
import { VoteScreen } from "../../../src/games/mafia/features/day/VoteScreen";

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

describe("Lover game flow", () => {
  it("excludes the Lover and the previous target from the next visit", () => {
    let state = stateForRoles([
      "lover",
      "mafia",
      "commissioner",
      "doctor",
      "civilian",
      "civilian",
      "civilian",
    ]);
    state = {
      ...state,
      previousLoverTargetId: "player-6",
      phase: {
        kind: "night-step",
        nightNumber: 2,
        plan: [{ kind: "lover-visit", actorPlayerIds: ["player-1"], isDummy: false }],
        stepIndex: 0,
        actions: {},
        selectedPlayerId: null,
      },
    };

    expect(nightTargetPlayers(state).map((player) => player.id)).not.toContain("player-1");
    expect(nightTargetPlayers(state).map((player) => player.id)).not.toContain("player-6");
    state = reduce(state, { type: "select-night-target", playerId: "player-6" });
    expect(state.phase).toMatchObject({ selectedPlayerId: null });
    state = reduce(state, { type: "select-night-target", playerId: "player-7" });
    expect(state.phase).toMatchObject({ selectedPlayerId: "player-7" });
  });

  it("advances when the living Lover has no legal target", () => {
    let state = stateForRoles([
      "lover",
      "maniac",
      "mafia",
      "civilian",
      "civilian",
    ]);
    state = {
      ...state,
      alivePlayerIds: ["player-1", "player-2"],
      previousLoverTargetId: "player-2",
      phase: {
        kind: "night-step",
        nightNumber: 3,
        plan: [
          { kind: "lover-visit", actorPlayerIds: ["player-1"], isDummy: false },
          { kind: "maniac-kill", actorPlayerIds: ["player-2"], isDummy: false },
        ],
        stepIndex: 0,
        actions: {},
        selectedPlayerId: null,
      },
    };

    expect(nightTargetPlayers(state)).toEqual([]);
    state = reduce(state, { type: "finish-night-step" });
    expect(state.phase).toMatchObject({
      kind: "night-transition",
      nextStepIndex: 1,
      message: "Любовница закрывает глаза",
    });
  });

  it("keeps the one-day vote block and clears it before the next night", () => {
    let state = stateForRoles([
      "lover",
      "mafia",
      "commissioner",
      "doctor",
      "civilian",
      "civilian",
      "civilian",
    ]);
    state = {
      ...state,
      roleSetup: { ...state.roleSetup, lover: 1, loverMode: "block-vote" },
      phase: {
        kind: "night-transition",
        nightNumber: 1,
        plan: [
          { kind: "lover-visit", actorPlayerIds: ["player-1"], isDummy: false },
          { kind: "mafia-kill", actorPlayerIds: ["player-2"], isDummy: false },
        ],
        nextStepIndex: 2,
        actions: {
          "lover-visit": "player-6",
          "mafia-kill": "player-1",
        },
        message: "Мафия закрывает глаза",
        delayMs: 3000,
      },
    };

    state = reduce(state, { type: "continue-night" });
    expect(state.voteBlockedPlayerId).toBe("player-6");
    expect(state.previousLoverTargetId).toBe("player-6");
    expect(state.alivePlayerIds).not.toContain("player-1");
    state = reduce(state, { type: "continue-dawn" });
    state = reduce(state, { type: "start-vote" });
    expect(state.voteBlockedPlayerId).toBe("player-6");
    state = reduce(state, { type: "select-vote-target", playerId: "no-elimination" });
    state = reduce(state, { type: "confirm-vote" });
    state = reduce(state, { type: "continue-elimination" });
    expect(state.voteBlockedPlayerId).toBeNull();
    expect(state.phase.kind).toBe("night-cover");
  });

  it("marks a vote-blocked player without disabling their target row", () => {
    const onSelect = vi.fn();
    act(() => root.render(
      <VoteScreen
        dayNumber={2}
        players={[
          { id: "player-1", name: "Игрок 1" },
          { id: "player-2", name: "Игрок 2" },
        ]}
        voteBlockedPlayerId="player-2"
        selectedId={null}
        onSelect={onSelect}
        onOpenSettings={vi.fn()}
        onBack={vi.fn()}
        onConfirm={vi.fn()}
      />,
    ));

    const indicator = container.querySelector<HTMLElement>('[aria-label="Без права голоса"]');
    const target = indicator?.closest("button");
    expect(indicator).not.toBeNull();
    expect(target?.disabled).toBe(false);
    act(() => target?.click());
    expect(onSelect).toHaveBeenCalledWith("player-2");
  });
});

function stateForRoles(roles: readonly MafiaRole[]): MafiaGameState {
  const players = createPlayers(roles.length);
  return {
    ...createInitialGameState(),
    players,
    roleSetup: {
      ...createInitialGameState().roleSetup,
      playerCount: roles.length,
    },
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
