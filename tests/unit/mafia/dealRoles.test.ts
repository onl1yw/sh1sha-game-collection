import { describe, expect, it } from "vitest";

import { dealRoles, RoleDealError } from "../../../src/games/mafia/domain/dealRoles";
import { getDefaultRoleSetup } from "../../../src/games/mafia/domain/roleSetup";
import type { RandomSource } from "../../../src/games/mafia/domain/random";

class ConstantRandom implements RandomSource {
  constructor(private readonly value: number) {}
  next(): number {
    return this.value;
  }
}

const players = Array.from({ length: 8 }, (_, index) => ({
  id: `player-${index + 1}`,
  name: `Игрок ${index + 1}`,
}));

describe("dealRoles", () => {
  it("deals one role per player and records role teams", () => {
    const assignments = dealRoles(
      players,
      getDefaultRoleSetup(8),
      new ConstantRandom(0),
    );

    expect(assignments.map((assignment) => assignment.playerId)).toEqual(
      players.map((player) => player.id),
    );
    expect(assignments).toHaveLength(8);
    expect(assignments.filter((item) => item.role === "don")).toHaveLength(1);
    expect(assignments.filter((item) => item.role === "mafia")).toHaveLength(1);
    expect(assignments.filter((item) => item.role === "civilian")).toHaveLength(4);
    expect(assignments.find((item) => item.role === "don")?.team).toBe("mafia");
    expect(assignments.find((item) => item.role === "doctor")?.team).toBe("town");
  });

  it("rejects invalid players before consuming randomness", () => {
    const invalidPlayers = players.map((player, index) => ({
      ...player,
      id: index < 2 ? "same" : player.id,
    }));

    expect(() => dealRoles(
      invalidPlayers,
      getDefaultRoleSetup(8),
      new ConstantRandom(0),
    )).toThrow(RoleDealError);
  });

  it("deals the selected Host through the same shuffled role deck", () => {
    const participants = Array.from({ length: 6 }, (_, index) => ({
      id: `participant-${index + 1}`,
      name: `Участник ${index + 1}`,
    }));
    const setup = {
      ...getDefaultRoleSetup(5),
      playerCount: participants.length,
      hostByLot: true,
    };

    const assignments = dealRoles(participants, setup, new ConstantRandom(0));

    expect(assignments).toHaveLength(6);
    expect(assignments.filter((item) => item.role === "host")).toHaveLength(1);
    expect(assignments.find((item) => item.role === "host")?.team).toBe("neutral");
  });

  it("rejects random values outside the unit interval", () => {
    expect(() => dealRoles(
      players,
      getDefaultRoleSetup(8),
      new ConstantRandom(1),
    )).toThrow(/\[0, 1\)/);
  });
});
