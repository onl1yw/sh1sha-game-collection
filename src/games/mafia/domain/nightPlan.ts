import type {
  DeathReveal,
  MafiaRole,
  NightStep,
  NightStepKind,
  RoleAssignment,
} from "./types";

export interface NightPlanInput {
  assignments: readonly RoleAssignment[];
  alivePlayerIds: readonly string[];
  deathReveal: DeathReveal;
}

interface StepDefinition {
  kind: NightStepKind;
  actorRoles: readonly MafiaRole[];
}

const STEP_DEFINITIONS: readonly StepDefinition[] = [
  { kind: "lover-visit", actorRoles: ["lover"] },
  { kind: "mafia-kill", actorRoles: ["mafia", "don"] },
  { kind: "don-check", actorRoles: ["don"] },
  { kind: "commissioner-check", actorRoles: ["commissioner"] },
  { kind: "doctor-protect", actorRoles: ["doctor"] },
  { kind: "maniac-kill", actorRoles: ["maniac"] },
];

export function createNightPlan(input: NightPlanInput): NightStep[] {
  const aliveIds = new Set(input.alivePlayerIds);
  const result: NightStep[] = [];

  for (const definition of STEP_DEFINITIONS) {
    const configuredActors = input.assignments.filter((assignment) =>
      definition.actorRoles.includes(assignment.role)
    );
    if (configuredActors.length === 0) continue;

    const actorPlayerIds = configuredActors
      .filter((assignment) => aliveIds.has(assignment.playerId))
      .map((assignment) => assignment.playerId);
    const isDummy = actorPlayerIds.length === 0;
    if (isDummy && input.deathReveal === "always") continue;
    result.push({ kind: definition.kind, actorPlayerIds, isDummy });
  }

  return result;
}
