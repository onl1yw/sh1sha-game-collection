import { describe, expect, it } from "vitest";

import { getDefaultRoleSetup } from "../../../src/games/mafia/domain/roleSetup";
import type { RoleSetup } from "../../../src/games/mafia/domain/types";
import { validateSetup } from "../../../src/games/mafia/domain/validateSetup";

describe("validateSetup", () => {
  it("accepts a valid custom setup and matching players", () => {
    const setup = { ...getDefaultRoleSetup(9), maniac: 1 as const };
    const players = Array.from({ length: 9 }, (_, index) => ({
      id: `player-${index + 1}`,
      name: `Игрок ${index + 1}`,
    }));

    expect(validateSetup(setup, players)).toEqual({ valid: true, errors: [] });
  });

  it("requires Don to have ordinary mafia and a Commissioner", () => {
    const setup: RoleSetup = {
      ...getDefaultRoleSetup(8),
      ordinaryMafiaCount: 0,
      commissioner: 0,
    };
    const errors = validateSetup(setup).errors.join(" ");

    expect(errors).toMatch(/обычный игрок мафии/);
    expect(errors).toMatch(/Дона.*Комиссаром/);
  });

  it("allows Maniac only from nine players", () => {
    const result = validateSetup({
      ...getDefaultRoleSetup(8),
      maniac: 1,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toMatch(/Маньяк.*9/);
  });

  it("allows Lover only from seven active players", () => {
    const unavailable = validateSetup({
      ...getDefaultRoleSetup(6),
      lover: 1,
    });
    const available = validateSetup({
      ...getDefaultRoleSetup(7),
      lover: 1,
    });

    expect(unavailable.errors.join(" ")).toMatch(/Любовница.*7/);
    expect(available.valid).toBe(true);
  });

  it("rejects an unknown Lover mode", () => {
    const result = validateSetup({
      ...getDefaultRoleSetup(7),
      loverMode: "unknown",
    } as unknown as RoleSetup);

    expect(result.errors.join(" ")).toMatch(/режим Любовницы/);
  });

  it("does not count the neutral Host toward Maniac availability", () => {
    const result = validateSetup({
      ...getDefaultRoleSetup(9),
      hostByLot: true,
      maniac: 1,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toMatch(/Маньяк.*9/);
  });

  it("keeps at least two automatic civilians", () => {
    const result = validateSetup({
      ...getDefaultRoleSetup(5),
      ordinaryMafiaCount: 3,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toMatch(/два мирных/);
  });

  it("requires five active players when a Host is selected by lot", () => {
    const tooSmall = {
      ...getDefaultRoleSetup(5),
      hostByLot: true,
    };
    const valid = {
      ...getDefaultRoleSetup(5),
      playerCount: 6,
      hostByLot: true,
    };

    expect(validateSetup(tooSmall).errors.join(" ")).toMatch(/Активных.*5/);
    expect(validateSetup(valid)).toEqual({ valid: true, errors: [] });
  });

  it("rejects repeated players and invalid unique-role counts", () => {
    const invalidCounts = {
      ...getDefaultRoleSetup(5),
      doctor: 2,
    } as unknown as RoleSetup;
    const players = Array.from({ length: 5 }, (_, index) => ({
      id: index < 2 ? "same" : `player-${index}`,
      name: index === 4 ? "" : `Игрок ${index + 1}`,
    }));
    const errors = validateSetup(invalidCounts, players).errors.join(" ");

    expect(errors).toMatch(/Доктор/);
    expect(errors).toMatch(/повторяется/);
    expect(errors).toMatch(/нет имени/);
  });
});
