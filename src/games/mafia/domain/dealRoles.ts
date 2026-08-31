import { createRoleDeck, teamForRole } from "./roleSetup";
import { shuffle, type RandomSource } from "./random";
import type { MafiaPlayer, RoleAssignment, RoleSetup } from "./types";
import { validateSetup } from "./validateSetup";

export class RoleDealError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoleDealError";
  }
}

export function dealRoles(
  players: readonly MafiaPlayer[],
  roleSetup: RoleSetup,
  random: RandomSource,
): RoleAssignment[] {
  const validation = validateSetup(roleSetup, players);
  if (!validation.valid) {
    throw new RoleDealError(validation.errors.join("; "));
  }

  const roles = shuffle(createRoleDeck(roleSetup), random);
  return players.map((player, index) => {
    const role = roles[index];
    if (!role) throw new RoleDealError("Не хватило роли для каждого игрока");
    return { playerId: player.id, role, team: teamForRole(role) };
  });
}
