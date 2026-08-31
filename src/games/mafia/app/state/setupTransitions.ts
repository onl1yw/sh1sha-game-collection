import type { RoleSetup } from "../../domain/types";
import {
  getActivePlayerCount,
  MAX_MAFIA_PARTICIPANTS,
  MAX_MAFIA_PLAYERS,
  MIN_MAFIA_PLAYERS,
} from "../../domain/roleSetup";
import type { EditableUniqueRole } from "./gameActions";
import {
  fitRoleSetup,
  resizePlayers,
  type MafiaGameState,
} from "./gameState";

export function setPlayerCount(
  state: MafiaGameState,
  count: number,
): MafiaGameState {
  if (state.phase.kind !== "setup" || !Number.isInteger(count)) return state;
  const hostCount = state.roleSetup.hostByLot ? 1 : 0;
  const players = resizePlayers(
    state.players,
    count,
    MIN_MAFIA_PLAYERS + hostCount,
    hostCount ? MAX_MAFIA_PARTICIPANTS : MAX_MAFIA_PLAYERS,
  );
  return {
    ...state,
    players,
    roleSetup: fitRoleSetup(state.roleSetup, players.length),
    errorMessage: null,
  };
}

export function setMafiaCount(
  state: MafiaGameState,
  count: number,
): MafiaGameState {
  if (state.phase.kind !== "setup" || !Number.isInteger(count)) return state;
  const uniqueCount = state.roleSetup.don + state.roleSetup.commissioner
    + state.roleSetup.doctor + state.roleSetup.lover + state.roleSetup.maniac
    + (state.roleSetup.hostByLot ? 1 : 0);
  const maximum = Math.max(1, state.players.length - uniqueCount - 2);
  return setupOnly(state, {
    roleSetup: {
      ...state.roleSetup,
      ordinaryMafiaCount: Math.max(1, Math.min(maximum, count)),
    },
  });
}

export function setUniqueRole(
  state: MafiaGameState,
  role: EditableUniqueRole,
  count: 0 | 1,
): MafiaGameState {
  if (state.phase.kind !== "setup") return state;
  if (role === "maniac" && count === 1
    && getActivePlayerCount(state.roleSetup) < 9) return state;
  if (role === "lover" && count === 1
    && getActivePlayerCount(state.roleSetup) < 7) return state;
  const roleSetup: RoleSetup = { ...state.roleSetup, [role]: count };
  if (role === "don" && count === 1) roleSetup.commissioner = 1;
  if (role === "commissioner" && count === 0) roleSetup.don = 0;
  return setupOnly(state, { roleSetup });
}

export function setHostByLot(
  state: MafiaGameState,
  enabled: boolean,
): MafiaGameState {
  if (state.phase.kind !== "setup") return state;
  const minimum = enabled ? MIN_MAFIA_PLAYERS + 1 : MIN_MAFIA_PLAYERS;
  const maximum = enabled ? MAX_MAFIA_PARTICIPANTS : MAX_MAFIA_PLAYERS;
  const players = resizePlayers(state.players, state.players.length, minimum, maximum);
  return setupOnly(state, {
    players,
    roleSetup: fitRoleSetup(
      { ...state.roleSetup, hostByLot: enabled },
      players.length,
    ),
  });
}

export function setupOnly(
  state: MafiaGameState,
  patch: Partial<Pick<MafiaGameState, "players" | "roleSetup">>,
): MafiaGameState {
  return state.phase.kind === "setup"
    ? { ...state, ...patch, errorMessage: null }
    : state;
}
