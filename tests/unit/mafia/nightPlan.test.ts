import { describe, expect, it } from "vitest";

import { createNightPlan } from "../../../src/games/mafia/domain/nightPlan";
import { teamForRole } from "../../../src/games/mafia/domain/roleSetup";
import type { MafiaRole, RoleAssignment } from "../../../src/games/mafia/domain/types";

const assignments = assignmentList([
  "mafia",
  "don",
  "commissioner",
  "doctor",
  "lover",
  "maniac",
  "civilian",
  "civilian",
]);

describe("createNightPlan", () => {
  it("orders every configured role action", () => {
    const plan = createNightPlan({
      assignments,
      alivePlayerIds: assignments.map((item) => item.playerId),
      deathReveal: "always",
    });

    expect(plan.map((step) => step.kind)).toEqual([
      "lover-visit",
      "mafia-kill",
      "don-check",
      "commissioner-check",
      "doctor-protect",
      "maniac-kill",
    ]);
    expect(plan.every((step) => !step.isDummy)).toBe(true);
    expect(plan[0]?.actorPlayerIds).toEqual(["player-5"]);
    expect(plan[1]?.actorPlayerIds).toEqual(["player-1", "player-2"]);
  });

  it("omits dead role actions when roles are revealed", () => {
    const plan = createNightPlan({
      assignments,
      alivePlayerIds: ["player-1", "player-3", "player-6", "player-7"],
      deathReveal: "always",
    });

    expect(plan.map((step) => step.kind)).toEqual([
      "mafia-kill",
      "commissioner-check",
      "maniac-kill",
    ]);
  });

  it("retains dummy calls when dead roles stay hidden", () => {
    const plan = createNightPlan({
      assignments,
      alivePlayerIds: ["player-1", "player-3", "player-6", "player-7"],
      deathReveal: "never",
    });

    expect(plan.map((step) => [step.kind, step.isDummy])).toEqual([
      ["lover-visit", true],
      ["mafia-kill", false],
      ["don-check", true],
      ["commissioner-check", false],
      ["doctor-protect", true],
      ["maniac-kill", false],
    ]);
  });
});

function assignmentList(roles: readonly MafiaRole[]): RoleAssignment[] {
  return roles.map((role, index) => ({
    playerId: `player-${index + 1}`,
    role,
    team: teamForRole(role),
  }));
}
