import type { MafiaGameAction } from "./gameActions";
import { confirmVote, continueElimination, selectVoteTarget } from "./dayTransitions";
import type { MafiaGameState } from "./gameState";
import {
  confirmNightAction,
  continueNight,
  finishNightStep,
  selectNightTarget,
  startNight,
} from "./nightTransitions";
import {
  setMafiaCount,
  setHostByLot,
  setPlayerCount,
  setupOnly,
  setUniqueRole,
} from "./setupTransitions";

export function mafiaGameReducer(
  state: MafiaGameState,
  action: MafiaGameAction,
): MafiaGameState {
  switch (action.type) {
    case "set-player-count":
      return setPlayerCount(state, action.count);
    case "set-player-name":
      return setupOnly(state, {
        players: state.players.map((player) => player.id === action.playerId
          ? { ...player, name: action.name }
          : player),
      });
    case "set-mafia-count":
      return setMafiaCount(state, action.count);
    case "set-unique-role":
      return setUniqueRole(state, action.role, action.count);
    case "set-lover-mode":
      return setupOnly(state, {
        roleSetup: { ...state.roleSetup, loverMode: action.mode },
      });
    case "set-host-by-lot":
      return setHostByLot(state, action.enabled);
    case "set-death-reveal":
      return setupOnly(state, {
        roleSetup: {
          ...state.roleSetup,
          deathReveal: action.reveal ? "always" : "never",
        },
      });
    case "roles-dealt":
      if (state.phase.kind !== "setup") return state;
      return {
        ...state,
        players: state.players.map((player) => ({
          ...player,
          name: action.playerNames.get(player.id) ?? player.name,
        })),
        assignments: action.assignments,
        alivePlayerIds: action.assignments
          .filter((assignment) => assignment.role !== "host")
          .map((assignment) => assignment.playerId),
        previousLoverTargetId: null,
        voteBlockedPlayerId: null,
        phase: { kind: "deal-cover", playerIndex: 0 },
        errorMessage: null,
      };
    case "reveal-role":
      return state.phase.kind === "deal-cover"
        ? { ...state, phase: { kind: "deal-role", playerIndex: state.phase.playerIndex } }
        : state;
    case "hide-role":
      return hideRole(state);
    case "start-night":
      return startNight(state);
    case "select-night-target":
      return selectNightTarget(state, action.playerId);
    case "confirm-night-action":
      return confirmNightAction(state);
    case "finish-night-step":
      return finishNightStep(state);
    case "continue-night":
      return continueNight(state);
    case "continue-dawn":
      if (state.phase.kind !== "dawn") return state;
      return state.phase.pendingWinner
        ? { ...state, phase: { kind: "results", winner: state.phase.pendingWinner } }
        : { ...state, phase: { kind: "discussion", dayNumber: state.phase.nightNumber } };
    case "start-vote":
      return state.phase.kind === "discussion"
        ? { ...state, phase: { kind: "vote", dayNumber: state.phase.dayNumber, selectedPlayerId: null } }
        : state;
    case "back-to-discussion":
      return state.phase.kind === "vote"
        ? { ...state, phase: { kind: "discussion", dayNumber: state.phase.dayNumber } }
        : state;
    case "select-vote-target":
      return selectVoteTarget(state, action.playerId);
    case "confirm-vote":
      return confirmVote(state);
    case "continue-elimination":
      return continueElimination(state);
    case "return-to-setup":
      return {
        ...state,
        phase: { kind: "setup" },
        assignments: [],
        alivePlayerIds: [],
        previousLoverTargetId: null,
        voteBlockedPlayerId: null,
        errorMessage: null,
      };
    case "set-error":
      return { ...state, errorMessage: action.message };
  }
}

function hideRole(state: MafiaGameState): MafiaGameState {
  if (state.phase.kind !== "deal-role") return state;
  const nextIndex = state.phase.playerIndex + 1;
  return nextIndex < state.players.length
    ? { ...state, phase: { kind: "deal-cover", playerIndex: nextIndex } }
    : { ...state, phase: { kind: "night-cover", nightNumber: 1 } };
}
