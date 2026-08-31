import { describe, expect, it } from "vitest";

import {
  NightResolutionError,
  resolveNight,
} from "../../../src/games/mafia/domain/resolveNight";
import { teamForRole } from "../../../src/games/mafia/domain/roleSetup";
import type { MafiaRole, RoleAssignment } from "../../../src/games/mafia/domain/types";

const assignments = assignmentList([
  "mafia",
  "don",
  "commissioner",
  "doctor",
  "maniac",
  "civilian",
  "civilian",
]);
const allAlive = assignments.map((item) => item.playerId);

describe("resolveNight", () => {
  it("resolves checks and blocks simultaneous attacks on a protected player", () => {
    const result = resolveNight({
      assignments,
      alivePlayerIds: allAlive,
      loverMode: "protect-and-link",
      previousLoverTargetId: null,
      actions: {
        "mafia-kill": "player-6",
        "don-check": "player-3",
        "commissioner-check": "player-2",
        "doctor-protect": "player-6",
        "maniac-kill": "player-6",
      },
    });

    expect(result.eliminatedPlayerIds).toEqual([]);
    expect(result.protectedPlayerId).toBe("player-6");
    expect(result.killAttempts).toEqual([
      { kind: "mafia-kill", targetPlayerId: "player-6", prevented: true },
      { kind: "maniac-kill", targetPlayerId: "player-6", prevented: true },
    ]);
    expect(result.checks).toEqual([
      { kind: "don-check", targetPlayerId: "player-3", positive: true },
      { kind: "commissioner-check", targetPlayerId: "player-2", positive: true },
    ]);
  });

  it("eliminates two different targets simultaneously", () => {
    const result = resolveNight({
      assignments,
      alivePlayerIds: allAlive,
      loverMode: "protect-and-link",
      previousLoverTargetId: null,
      actions: {
        "mafia-kill": "player-6",
        "maniac-kill": "player-7",
      },
    });

    expect(result.eliminatedPlayerIds).toEqual(["player-6", "player-7"]);
  });

  it("rejects a dead target and an action without a living actor", () => {
    expect(() => resolveNight({
      assignments,
      alivePlayerIds: allAlive.filter((id) => id !== "player-7"),
      loverMode: "protect-and-link",
      previousLoverTargetId: null,
      actions: { "mafia-kill": "player-7" },
    })).toThrow(NightResolutionError);

    expect(() => resolveNight({
      assignments,
      alivePlayerIds: allAlive.filter((id) => id !== "player-4"),
      loverMode: "protect-and-link",
      previousLoverTargetId: null,
      actions: { "doctor-protect": "player-6" },
    })).toThrow(/doctor-protect/);
  });

  it("rejects Mafia-team and self targets forbidden by role rules", () => {
    expect(() => resolveNight({
      assignments,
      alivePlayerIds: allAlive,
      loverMode: "protect-and-link",
      previousLoverTargetId: null,
      actions: { "mafia-kill": "player-2" },
    })).toThrow(/mafia-kill/);

    expect(() => resolveNight({
      assignments,
      alivePlayerIds: allAlive,
      loverMode: "protect-and-link",
      previousLoverTargetId: null,
      actions: { "maniac-kill": "player-5" },
    })).toThrow(/maniac-kill/);
  });

  it("protects the Lover target from every direct attack", () => {
    const roster = loverAssignments();
    const result = resolveNight({
      assignments: roster,
      alivePlayerIds: roster.map((item) => item.playerId),
      loverMode: "protect-and-link",
      previousLoverTargetId: null,
      actions: {
        "lover-visit": "player-6",
        "mafia-kill": "player-6",
        "maniac-kill": "player-6",
      },
    });

    expect(result.eliminatedPlayerIds).toEqual([]);
    expect(result.loverProtectedPlayerId).toBe("player-6");
    expect(result.killAttempts.every((attempt) => attempt.prevented)).toBe(true);
  });

  it("links the target death even through target protection", () => {
    const roster = loverAssignments();
    const result = resolveNight({
      assignments: roster,
      alivePlayerIds: roster.map((item) => item.playerId),
      loverMode: "protect-and-link",
      previousLoverTargetId: null,
      actions: {
        "lover-visit": "player-6",
        "doctor-protect": "player-6",
        "mafia-kill": "player-5",
      },
    });

    expect(result.eliminatedPlayerIds).toEqual(["player-5", "player-6"]);
    expect(result.linkedPlayerId).toBe("player-6");
  });

  it("does not link deaths when Doctor saves the Lover", () => {
    const roster = loverAssignments();
    const result = resolveNight({
      assignments: roster,
      alivePlayerIds: roster.map((item) => item.playerId),
      loverMode: "protect-and-link",
      previousLoverTargetId: null,
      actions: {
        "lover-visit": "player-6",
        "doctor-protect": "player-5",
        "mafia-kill": "player-5",
      },
    });

    expect(result.eliminatedPlayerIds).toEqual([]);
    expect(result.linkedPlayerId).toBeNull();
  });

  it("keeps a vote block when the Lover dies later that night", () => {
    const roster = loverAssignments();
    const result = resolveNight({
      assignments: roster,
      alivePlayerIds: roster.map((item) => item.playerId),
      loverMode: "block-vote",
      previousLoverTargetId: null,
      actions: {
        "lover-visit": "player-6",
        "mafia-kill": "player-5",
      },
    });

    expect(result.eliminatedPlayerIds).toEqual(["player-5"]);
    expect(result.voteBlockedPlayerId).toBe("player-6");
    expect(result.loverProtectedPlayerId).toBeNull();
  });

  it("does not protect a vote-blocked target from killing", () => {
    const roster = loverAssignments();
    const result = resolveNight({
      assignments: roster,
      alivePlayerIds: roster.map((item) => item.playerId),
      loverMode: "block-vote",
      previousLoverTargetId: null,
      actions: {
        "lover-visit": "player-6",
        "mafia-kill": "player-6",
      },
    });

    expect(result.eliminatedPlayerIds).toEqual(["player-6"]);
    expect(result.voteBlockedPlayerId).toBeNull();
    expect(result.killAttempts[0]?.prevented).toBe(false);
  });

  it("rejects self-targeting and the previous Lover target", () => {
    const roster = loverAssignments();
    const base = {
      assignments: roster,
      alivePlayerIds: roster.map((item) => item.playerId),
      loverMode: "protect-and-link" as const,
    };

    expect(() => resolveNight({
      ...base,
      previousLoverTargetId: null,
      actions: { "lover-visit": "player-5" },
    })).toThrow(/выбрать себя/);
    expect(() => resolveNight({
      ...base,
      previousLoverTargetId: "player-6",
      actions: { "lover-visit": "player-6" },
    })).toThrow(/повторить цель/);
  });
});

function loverAssignments(): RoleAssignment[] {
  return assignmentList([
    "mafia",
    "commissioner",
    "doctor",
    "maniac",
    "lover",
    "civilian",
    "civilian",
  ]);
}

function assignmentList(roles: readonly MafiaRole[]): RoleAssignment[] {
  return roles.map((role, index) => ({
    playerId: `player-${index + 1}`,
    role,
    team: teamForRole(role),
  }));
}
