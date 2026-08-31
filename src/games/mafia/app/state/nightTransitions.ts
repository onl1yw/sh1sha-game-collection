import { determineWinner } from "../../domain/determineWinner";
import { createNightPlan } from "../../domain/nightPlan";
import { resolveNight } from "../../domain/resolveNight";
import type {
  NightActions,
  NightCheckResult,
  NightStep,
  NightStepKind,
} from "../../domain/types";
import type { MafiaGameState } from "./gameState";
import { nightTargetPlayers } from "./selectors";

export const NIGHT_START_DELAY_MS = 3000;
export const DUMMY_NIGHT_ACTION_DELAY_MS = 15000;
export const NO_TARGET_NIGHT_ACTION_DELAY_MS = 3000;
export const NIGHT_HANDOFF_DELAY_MS = 3000;

export function startNight(state: MafiaGameState): MafiaGameState {
  if (state.phase.kind !== "night-cover") return state;
  const plan = createNightPlan({
    assignments: state.assignments,
    alivePlayerIds: state.alivePlayerIds,
    deathReveal: state.roleSetup.deathReveal,
  });
  if (plan.length === 0) return state;
  return {
    ...state,
    phase: {
      kind: "night-transition",
      nightNumber: state.phase.nightNumber,
      plan,
      nextStepIndex: 0,
      actions: {},
      message: state.roleSetup.hostByLot
        ? "Все, кроме ведущего, закрывают глаза"
        : "Закройте глаза. Ночь начинается",
      delayMs: NIGHT_START_DELAY_MS,
    },
  };
}

export function selectNightTarget(
  state: MafiaGameState,
  playerId: string,
): MafiaGameState {
  if (state.phase.kind !== "night-step") return state;
  if (!nightTargetPlayers(state).some((player) => player.id === playerId)) return state;
  return { ...state, phase: { ...state.phase, selectedPlayerId: playerId } };
}

export function confirmNightAction(
  state: MafiaGameState,
): MafiaGameState {
  if (state.phase.kind !== "night-step") return state;
  const step = state.phase.plan[state.phase.stepIndex];
  if (!step || step.isDummy) return state;
  const targetId = state.phase.selectedPlayerId;
  if (!targetId) return state;
  const actions: NightActions = { ...state.phase.actions, [step.kind]: targetId };
  const result = createCheckResult(state, step.kind, targetId);
  return result
    ? { ...state, phase: { ...state.phase, kind: "night-feedback", actions, result } }
    : toNightTransition(state, step, state.phase.stepIndex + 1, actions);
}

export function finishNightStep(state: MafiaGameState): MafiaGameState {
  if (state.phase.kind !== "night-step" && state.phase.kind !== "night-feedback") {
    return state;
  }
  const step = state.phase.plan[state.phase.stepIndex];
  if (
    state.phase.kind === "night-step"
    && !step?.isDummy
    && nightTargetPlayers(state).length > 0
  ) return state;
  return step
    ? toNightTransition(state, step, state.phase.stepIndex + 1, state.phase.actions)
    : state;
}

export function continueNight(state: MafiaGameState): MafiaGameState {
  if (state.phase.kind !== "night-transition") return state;
  const nextStep = state.phase.plan[state.phase.nextStepIndex];
  if (nextStep) {
    return {
      ...state,
      phase: {
        kind: "night-step",
        nightNumber: state.phase.nightNumber,
        plan: state.phase.plan,
        stepIndex: state.phase.nextStepIndex,
        actions: state.phase.actions,
        selectedPlayerId: null,
      },
    };
  }
  const resolution = resolveNight({
    assignments: state.assignments,
    alivePlayerIds: state.alivePlayerIds,
    actions: state.phase.actions,
    loverMode: state.roleSetup.loverMode,
    previousLoverTargetId: state.previousLoverTargetId,
  });
  const eliminated = new Set(resolution.eliminatedPlayerIds);
  const alivePlayerIds = state.alivePlayerIds.filter((id) => !eliminated.has(id));
  return {
    ...state,
    alivePlayerIds,
    previousLoverTargetId: state.phase.actions["lover-visit"]
      ?? state.previousLoverTargetId,
    voteBlockedPlayerId: resolution.voteBlockedPlayerId,
    phase: {
      kind: "dawn",
      nightNumber: state.phase.nightNumber,
      eliminatedPlayerIds: resolution.eliminatedPlayerIds,
      pendingWinner: determineWinner(state.assignments, alivePlayerIds),
    },
  };
}

function createCheckResult(
  state: MafiaGameState,
  kind: NightStepKind,
  targetId: string,
): NightCheckResult | null {
  const target = state.assignments.find((assignment) => assignment.playerId === targetId);
  if (!target) return null;
  if (kind === "don-check") {
    return { kind, targetPlayerId: targetId, positive: target.role === "commissioner" };
  }
  if (kind === "commissioner-check") {
    return { kind, targetPlayerId: targetId, positive: target.team === "mafia" };
  }
  return null;
}

function toNightTransition(
  state: MafiaGameState,
  step: NightStep,
  nextStepIndex: number,
  actions: NightActions,
): MafiaGameState {
  if (state.phase.kind !== "night-step" && state.phase.kind !== "night-feedback") {
    return state;
  }
  return {
    ...state,
    phase: {
      kind: "night-transition",
      nightNumber: state.phase.nightNumber,
      plan: state.phase.plan,
      nextStepIndex,
      actions,
      message: `${nightRoleName(step.kind)} закрывает глаза`,
      delayMs: NIGHT_HANDOFF_DELAY_MS,
    },
  };
}

function nightRoleName(kind: NightStepKind): string {
  if (kind === "lover-visit") return "Любовница";
  if (kind === "mafia-kill") return "Мафия";
  if (kind === "don-check") return "Дон";
  if (kind === "commissioner-check") return "Комиссар";
  if (kind === "doctor-protect") return "Доктор";
  return "Маньяк";
}
