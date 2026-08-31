import type { MafiaRole, MafiaTeam, RoleSetup } from "./types";

export const MIN_MAFIA_PLAYERS = 5;
export const MAX_MAFIA_PLAYERS = 12;
export const MAX_MAFIA_PARTICIPANTS = MAX_MAFIA_PLAYERS + 1;

export function getDefaultRoleSetup(playerCount: number): RoleSetup {
  if (!Number.isInteger(playerCount)
    || playerCount < MIN_MAFIA_PLAYERS
    || playerCount > MAX_MAFIA_PLAYERS) {
    throw new RangeError(
      `Player count must be between ${MIN_MAFIA_PLAYERS} and ${MAX_MAFIA_PLAYERS}`,
    );
  }

  if (playerCount === 5) return setup(playerCount, 1, 0, 1, 0);
  if (playerCount === 6) return setup(playerCount, 2, 0, 1, 0);
  if (playerCount === 7) return setup(playerCount, 2, 0, 1, 1);
  if (playerCount === 8) return setup(playerCount, 1, 1, 1, 1);
  if (playerCount <= 11) return setup(playerCount, 2, 1, 1, 1);
  return setup(playerCount, 3, 1, 1, 1);
}

export function getCivilianCount(roleSetup: RoleSetup): number {
  return roleSetup.playerCount - countNonCivilianRoles(roleSetup);
}

export function getActivePlayerCount(roleSetup: RoleSetup): number {
  return roleSetup.playerCount - (roleSetup.hostByLot ? 1 : 0);
}

export function countNonCivilianRoles(roleSetup: RoleSetup): number {
  return roleSetup.ordinaryMafiaCount
    + roleSetup.don
    + roleSetup.commissioner
    + roleSetup.doctor
    + roleSetup.lover
    + roleSetup.maniac
    + (roleSetup.hostByLot ? 1 : 0);
}

export function createRoleDeck(roleSetup: RoleSetup): MafiaRole[] {
  return [
    ...repeatRole("mafia", roleSetup.ordinaryMafiaCount),
    ...repeatRole("don", roleSetup.don),
    ...repeatRole("commissioner", roleSetup.commissioner),
    ...repeatRole("doctor", roleSetup.doctor),
    ...repeatRole("lover", roleSetup.lover),
    ...repeatRole("maniac", roleSetup.maniac),
    ...repeatRole("host", roleSetup.hostByLot ? 1 : 0),
    ...repeatRole("civilian", getCivilianCount(roleSetup)),
  ];
}

export function teamForRole(role: MafiaRole): MafiaTeam {
  if (role === "mafia" || role === "don") return "mafia";
  if (role === "maniac") return "independent";
  if (role === "host") return "neutral";
  return "town";
}

function setup(
  playerCount: number,
  ordinaryMafiaCount: number,
  don: 0 | 1,
  commissioner: 0 | 1,
  doctor: 0 | 1,
): RoleSetup {
  return {
    playerCount,
    ordinaryMafiaCount,
    don,
    commissioner,
    doctor,
    lover: 0,
    loverMode: "protect-and-link",
    maniac: 0,
    hostByLot: false,
    deathReveal: "always",
  };
}

function repeatRole(role: MafiaRole, count: number): MafiaRole[] {
  if (!Number.isInteger(count) || count < 0) return [];
  return Array.from({ length: count }, () => role);
}
