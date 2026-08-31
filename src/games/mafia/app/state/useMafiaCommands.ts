import { useCallback, useMemo, type Dispatch } from "react";

import { dealRoles } from "../../domain/dealRoles";
import type { RandomSource } from "../../domain/random";
import { validateSetup } from "../../domain/validateSetup";
import type { MafiaGameAction } from "./gameActions";
import type { MafiaGameCommands } from "./gameContext";
import { normalizePlayerNames, type MafiaGameState } from "./gameState";

interface CommandDependencies {
  state: MafiaGameState;
  dispatch: Dispatch<MafiaGameAction>;
  random: RandomSource;
}

export function useMafiaCommands({
  state,
  dispatch,
  random,
}: CommandDependencies): MafiaGameCommands {
  const startGame = useCallback(() => {
    const validation = validateSetup(state.roleSetup);
    if (!validation.valid) {
      dispatch({ type: "set-error", message: validation.errors[0] ?? "Проверьте настройки" });
      return;
    }
    try {
      const players = normalizePlayerNames(state.players);
      const assignments = dealRoles(players, state.roleSetup, random);
      dispatch({
        type: "roles-dealt",
        assignments,
        playerNames: new Map(players.map((player) => [player.id, player.name])),
      });
    } catch (error) {
      dispatch({
        type: "set-error",
        message: error instanceof Error ? error.message : "Не удалось раздать роли",
      });
    }
  }, [dispatch, random, state.players, state.roleSetup]);

  return useMemo(() => ({
    setPlayerCount: (count: number) => dispatch({ type: "set-player-count", count }),
    setPlayerName: (playerId: string, name: string) =>
      dispatch({ type: "set-player-name", playerId, name }),
    setMafiaCount: (count: number) => dispatch({ type: "set-mafia-count", count }),
    setRoleEnabled: (role, enabled) =>
      dispatch({ type: "set-unique-role", role, count: enabled ? 1 : 0 }),
    setLoverMode: (mode) => dispatch({ type: "set-lover-mode", mode }),
    setHostByLot: (enabled: boolean) => dispatch({ type: "set-host-by-lot", enabled }),
    setRevealRoles: (reveal: boolean) => dispatch({ type: "set-death-reveal", reveal }),
    startGame,
    revealRole: () => dispatch({ type: "reveal-role" }),
    hideRole: () => dispatch({ type: "hide-role" }),
    startNight: () => dispatch({ type: "start-night" }),
    selectNightTarget: (playerId: string) => dispatch({ type: "select-night-target", playerId }),
    confirmNightAction: () => dispatch({ type: "confirm-night-action" }),
    finishNightStep: () => dispatch({ type: "finish-night-step" }),
    continueNight: () => dispatch({ type: "continue-night" }),
    continueDawn: () => dispatch({ type: "continue-dawn" }),
    startVote: () => dispatch({ type: "start-vote" }),
    backToDiscussion: () => dispatch({ type: "back-to-discussion" }),
    selectVoteTarget: (playerId: string) => dispatch({ type: "select-vote-target", playerId }),
    confirmVote: () => dispatch({ type: "confirm-vote" }),
    continueElimination: () => dispatch({ type: "continue-elimination" }),
    returnToSetup: () => dispatch({ type: "return-to-setup" }),
  }), [dispatch, startGame]);
}
