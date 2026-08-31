import { determineWinner } from "../../domain/determineWinner";
import { NO_ELIMINATION_ID } from "./gameActions";
import type { MafiaGameState } from "./gameState";

export function selectVoteTarget(
  state: MafiaGameState,
  playerId: string,
): MafiaGameState {
  if (state.phase.kind !== "vote") return state;
  if (playerId !== NO_ELIMINATION_ID && !state.alivePlayerIds.includes(playerId)) {
    return state;
  }
  return { ...state, phase: { ...state.phase, selectedPlayerId: playerId } };
}

export function confirmVote(state: MafiaGameState): MafiaGameState {
  if (state.phase.kind !== "vote" || state.phase.selectedPlayerId === null) return state;
  const playerId = state.phase.selectedPlayerId === NO_ELIMINATION_ID
    ? null
    : state.phase.selectedPlayerId;
  const alivePlayerIds = playerId
    ? state.alivePlayerIds.filter((id) => id !== playerId)
    : state.alivePlayerIds;
  return {
    ...state,
    alivePlayerIds,
    phase: {
      kind: "elimination",
      dayNumber: state.phase.dayNumber,
      playerId,
      pendingWinner: determineWinner(state.assignments, alivePlayerIds),
    },
  };
}

export function continueElimination(state: MafiaGameState): MafiaGameState {
  if (state.phase.kind !== "elimination") return state;
  return state.phase.pendingWinner
    ? { ...state, phase: { kind: "results", winner: state.phase.pendingWinner } }
    : {
        ...state,
        voteBlockedPlayerId: null,
        phase: { kind: "night-cover", nightNumber: state.phase.dayNumber + 1 },
      };
}
