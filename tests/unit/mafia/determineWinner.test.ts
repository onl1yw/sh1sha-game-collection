import { describe, expect, it } from "vitest";

import { determineWinner } from "../../../src/games/mafia/domain/determineWinner";
import { teamForRole } from "../../../src/games/mafia/domain/roleSetup";
import type { MafiaRole, RoleAssignment } from "../../../src/games/mafia/domain/types";

const assignments = assignmentList([
  "mafia",
  "don",
  "commissioner",
  "doctor",
  "maniac",
  "civilian",
]);

describe("determineWinner", () => {
  it("gives Town the win after every hostile role is gone", () => {
    expect(determineWinner(assignments, ["player-3", "player-4", "player-6"]))
      .toBe("town");
  });

  it("gives Mafia the win at parity only after Maniac is gone", () => {
    expect(determineWinner(assignments, [
      "player-1",
      "player-2",
      "player-3",
      "player-6",
    ])).toBe("mafia");
    expect(determineWinner(assignments, [
      "player-1",
      "player-2",
      "player-3",
      "player-5",
    ])).toBeNull();
  });

  it("gives Maniac the win as the sole survivor", () => {
    expect(determineWinner(assignments, ["player-5"])).toBe("maniac");
  });

  it("returns a draw when mutual elimination leaves nobody alive", () => {
    expect(determineWinner(assignments, [])).toBe("draw");
    expect(determineWinner([], ["missing-player"])).toBe("draw");
  });

  it("keeps playing before a win condition is met", () => {
    expect(determineWinner(assignments, [
      "player-1",
      "player-3",
      "player-4",
      "player-6",
    ])).toBeNull();
  });

  it("excludes the Host from parity and survivor counts", () => {
    const withHost = assignmentList(["mafia", "civilian", "host"]);

    expect(determineWinner(withHost, ["player-1", "player-2", "player-3"]))
      .toBe("mafia");
    expect(determineWinner(withHost, ["player-3"])).toBe("draw");
  });
});

function assignmentList(roles: readonly MafiaRole[]): RoleAssignment[] {
  return roles.map((role, index) => ({
    playerId: `player-${index + 1}`,
    role,
    team: teamForRole(role),
  }));
}
