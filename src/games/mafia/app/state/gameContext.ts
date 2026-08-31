import { createContext } from "react";

import type { LoverMode } from "../../domain/types";
import type { MafiaGameState } from "./gameState";

export interface MafiaGameCommands {
  setPlayerCount: (count: number) => void;
  setPlayerName: (playerId: string, name: string) => void;
  setMafiaCount: (count: number) => void;
  setRoleEnabled: (
    role: "don" | "commissioner" | "doctor" | "lover" | "maniac",
    enabled: boolean,
  ) => void;
  setLoverMode: (mode: LoverMode) => void;
  setHostByLot: (enabled: boolean) => void;
  setRevealRoles: (reveal: boolean) => void;
  startGame: () => void;
  revealRole: () => void;
  hideRole: () => void;
  startNight: () => void;
  selectNightTarget: (playerId: string) => void;
  confirmNightAction: () => void;
  finishNightStep: () => void;
  continueNight: () => void;
  continueDawn: () => void;
  startVote: () => void;
  backToDiscussion: () => void;
  selectVoteTarget: (playerId: string) => void;
  confirmVote: () => void;
  continueElimination: () => void;
  returnToSetup: () => void;
}

export interface MafiaGameContextValue {
  state: MafiaGameState;
  actions: MafiaGameCommands;
  narrationAvailable: boolean;
  narrationAudible: boolean;
}

export const MafiaGameContext = createContext<MafiaGameContextValue | null>(null);
