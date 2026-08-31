import { describe, expect, it } from "vitest";

import {
  createRoleDeck,
  getCivilianCount,
  getDefaultRoleSetup,
  teamForRole,
} from "../../../src/games/mafia/domain/roleSetup";

describe("Mafia role setup", () => {
  it.each([
    [5, 1, 0, 0, 3],
    [6, 2, 0, 0, 3],
    [7, 2, 0, 1, 3],
    [8, 1, 1, 1, 4],
    [9, 2, 1, 1, 4],
    [10, 2, 1, 1, 5],
    [11, 2, 1, 1, 6],
    [12, 3, 1, 1, 6],
  ])(
    "builds the default composition for %i players",
    (playerCount, ordinaryMafia, don, doctor, civilians) => {
      const setup = getDefaultRoleSetup(playerCount);

      expect(setup).toMatchObject({
        playerCount,
        ordinaryMafiaCount: ordinaryMafia,
        don,
        commissioner: 1,
        doctor,
        lover: 0,
        loverMode: "protect-and-link",
        maniac: 0,
        hostByLot: false,
        deathReveal: "always",
      });
      expect(getCivilianCount(setup)).toBe(civilians);
      expect(createRoleDeck(setup)).toHaveLength(playerCount);
    },
  );

  it("maps every role to its winning team", () => {
    expect(teamForRole("civilian")).toBe("town");
    expect(teamForRole("commissioner")).toBe("town");
    expect(teamForRole("doctor")).toBe("town");
    expect(teamForRole("lover")).toBe("town");
    expect(teamForRole("mafia")).toBe("mafia");
    expect(teamForRole("don")).toBe("mafia");
    expect(teamForRole("maniac")).toBe("independent");
    expect(teamForRole("host")).toBe("neutral");
  });

  it("adds one neutral Host without reducing the active role composition", () => {
    const setup = {
      ...getDefaultRoleSetup(5),
      playerCount: 6,
      hostByLot: true,
    };
    const deck = createRoleDeck(setup);

    expect(deck).toHaveLength(6);
    expect(deck.filter((role) => role === "host")).toHaveLength(1);
    expect(deck.filter((role) => role === "civilian")).toHaveLength(3);
    expect(getCivilianCount(setup)).toBe(3);
  });

  it("adds one Town Lover by replacing an automatic Civilian", () => {
    const setup = {
      ...getDefaultRoleSetup(7),
      lover: 1 as const,
    };
    const deck = createRoleDeck(setup);

    expect(deck.filter((role) => role === "lover")).toHaveLength(1);
    expect(deck.filter((role) => role === "civilian")).toHaveLength(2);
    expect(deck).toHaveLength(7);
  });

  it("rejects a default outside the supported player range", () => {
    expect(() => getDefaultRoleSetup(4)).toThrow(RangeError);
    expect(() => getDefaultRoleSetup(13)).toThrow(RangeError);
  });
});
