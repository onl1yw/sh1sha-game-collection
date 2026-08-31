import type { MafiaWinner, NightStepKind } from "../domain/types";
import {
  narrationCue,
  type NarrationClipId,
  type NarrationCue,
} from "./narrationCatalog";
import type { MafiaGameState } from "./state/gameState";
import { currentNightStep } from "./state/selectors";

export function narrationForState(state: MafiaGameState): NarrationCue | null {
  const phase = state.phase;
  if (phase.kind === "night-step") {
    const step = currentNightStep(state);
    if (!step) return null;
    return narrationCue(wakeClip(step.kind, state.roleSetup.loverMode));
  }
  if (phase.kind === "night-transition") {
    const completedStep = phase.plan[phase.nextStepIndex - 1];
    return narrationCue(completedStep ? sleepClip(completedStep.kind) : "night-begins");
  }
  if (phase.kind === "dawn") {
    return narrationCue(phase.eliminatedPlayerIds.length === 0 ? "dawn-safe" : "dawn-deaths");
  }
  if (phase.kind === "discussion") return narrationCue("discussion");
  if (phase.kind === "vote") return narrationCue("voting");
  if (phase.kind === "elimination") {
    return narrationCue(phase.playerId ? "elimination-player" : "elimination-none");
  }
  if (phase.kind === "results") return narrationCue(winnerClip(phase.winner));
  return null;
}

function wakeClip(kind: NightStepKind, loverMode: MafiaGameState["roleSetup"]["loverMode"]): NarrationClipId {
  if (kind === "lover-visit") {
    return loverMode === "protect-and-link" ? "lover-protect-wakes" : "lover-blocks-vote";
  }
  if (kind === "mafia-kill") return "mafia-wakes";
  if (kind === "don-check") return "don-wakes";
  if (kind === "commissioner-check") return "commissioner-wakes";
  if (kind === "doctor-protect") return "doctor-wakes";
  return "maniac-wakes";
}

function sleepClip(kind: NightStepKind): NarrationClipId {
  if (kind === "lover-visit") return "lover-sleeps";
  if (kind === "mafia-kill") return "mafia-sleeps";
  if (kind === "don-check") return "don-sleeps";
  if (kind === "commissioner-check") return "commissioner-sleeps";
  if (kind === "doctor-protect") return "doctor-sleeps";
  return "maniac-sleeps";
}

function winnerClip(winner: MafiaWinner): NarrationClipId {
  if (winner === "draw") return "result-draw";
  if (winner === "town") return "result-town";
  if (winner === "mafia") return "result-mafia";
  return "result-maniac";
}
