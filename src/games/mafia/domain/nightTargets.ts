import type {
  MafiaRole,
  NightStepKind,
  RoleAssignment,
} from "./types";

const ACTOR_ROLES: Readonly<Record<NightStepKind, readonly MafiaRole[]>> = {
  "lover-visit": ["lover"],
  "mafia-kill": ["mafia", "don"],
  "don-check": ["don"],
  "commissioner-check": ["commissioner"],
  "doctor-protect": ["doctor"],
  "maniac-kill": ["maniac"],
};

export interface NightTargetInput {
  assignments: readonly RoleAssignment[];
  alivePlayerIds: readonly string[];
  kind: NightStepKind;
  previousLoverTargetId: string | null;
}

export function nightActorPlayerIds(input: NightTargetInput): string[] {
  const aliveIds = new Set(input.alivePlayerIds);
  return input.assignments
    .filter((assignment) =>
      aliveIds.has(assignment.playerId)
      && ACTOR_ROLES[input.kind].includes(assignment.role)
    )
    .map((assignment) => assignment.playerId);
}

export function legalNightTargetIds(input: NightTargetInput): string[] {
  const aliveIds = new Set(input.alivePlayerIds);
  const actorIds = new Set(nightActorPlayerIds(input));
  return input.assignments
    .filter((assignment) =>
      aliveIds.has(assignment.playerId)
      && assignment.team !== "neutral"
      && targetAllowedForStep(input, assignment, actorIds)
    )
    .map((assignment) => assignment.playerId);
}

function targetAllowedForStep(
  input: NightTargetInput,
  target: RoleAssignment,
  actorIds: ReadonlySet<string>,
): boolean {
  if (input.kind === "lover-visit") {
    return !actorIds.has(target.playerId)
      && target.playerId !== input.previousLoverTargetId;
  }
  if (input.kind === "mafia-kill" || input.kind === "don-check") {
    return target.team !== "mafia";
  }
  if (input.kind === "doctor-protect") return true;
  return !actorIds.has(target.playerId);
}
