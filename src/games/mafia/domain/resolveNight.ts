import type {
  LoverMode,
  NightActions,
  NightCheckResult,
  NightKillAttempt,
  NightResolution,
  NightStepKind,
  RoleAssignment,
} from "./types";
import {
  legalNightTargetIds,
  nightActorPlayerIds,
} from "./nightTargets";

export interface ResolveNightInput {
  assignments: readonly RoleAssignment[];
  alivePlayerIds: readonly string[];
  actions: NightActions;
  loverMode: LoverMode;
  previousLoverTargetId: string | null;
}

export class NightResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NightResolutionError";
  }
}

export function resolveNight(input: ResolveNightInput): NightResolution {
  const aliveIds = new Set(input.alivePlayerIds);
  const assignmentsById = new Map(
    input.assignments.map((assignment) => [assignment.playerId, assignment]),
  );

  for (const [kind, targetId] of Object.entries(input.actions) as Array<
    [NightStepKind, string | null | undefined]
  >) {
    if (targetId === null || targetId === undefined) continue;
    if (!aliveIds.has(targetId) || !assignmentsById.has(targetId)) {
      throw new NightResolutionError(`Цель действия ${kind} не находится в игре`);
    }
    const targetInput = {
      assignments: input.assignments,
      alivePlayerIds: input.alivePlayerIds,
      kind,
      previousLoverTargetId: input.previousLoverTargetId,
    };
    if (nightActorPlayerIds(targetInput).length === 0) {
      throw new NightResolutionError(`Некому выполнить действие ${kind}`);
    }
    if (!legalNightTargetIds(targetInput).includes(targetId)) {
      throw new NightResolutionError(invalidTargetMessage(input, kind, targetId));
    }
  }

  const protectedPlayerId = input.actions["doctor-protect"] ?? null;
  const loverTargetId = input.actions["lover-visit"] ?? null;
  const loverProtectedPlayerId = input.loverMode === "protect-and-link"
    ? loverTargetId
    : null;
  const killAttempts = createKillAttempts(
    input.actions,
    new Set([protectedPlayerId, loverProtectedPlayerId].filter(isPlayerId)),
  );
  const eliminated = new Set(
    killAttempts
      .filter((attempt) => !attempt.prevented)
      .map((attempt) => attempt.targetPlayerId),
  );
  const loverId = input.assignments.find((assignment) =>
    assignment.role === "lover" && aliveIds.has(assignment.playerId)
  )?.playerId;
  const linkedPlayerId = input.loverMode === "protect-and-link"
    && loverId !== undefined
    && loverTargetId !== null
    && eliminated.has(loverId)
    ? loverTargetId
    : null;
  if (linkedPlayerId) eliminated.add(linkedPlayerId);
  const eliminatedPlayerIds = [...eliminated];
  const voteBlockedPlayerId = input.loverMode === "block-vote"
    && loverTargetId !== null
    && !eliminated.has(loverTargetId)
    ? loverTargetId
    : null;
  const checks = createChecks(input.actions, assignmentsById);

  return {
    eliminatedPlayerIds,
    protectedPlayerId,
    loverProtectedPlayerId,
    linkedPlayerId,
    voteBlockedPlayerId,
    killAttempts,
    checks,
  };
}

function invalidTargetMessage(
  input: ResolveNightInput,
  kind: NightStepKind,
  targetId: string,
): string {
  if (kind !== "lover-visit") return `Недопустимая цель действия ${kind}`;
  if (targetId === input.previousLoverTargetId) {
    return "Любовница не может повторить цель прошлой ночи";
  }
  return "Любовница не может выбрать себя";
}

function createKillAttempts(
  actions: NightActions,
  protectedPlayerIds: ReadonlySet<string>,
): NightKillAttempt[] {
  const attempts: NightKillAttempt[] = [];
  for (const kind of ["mafia-kill", "maniac-kill"] as const) {
    const targetPlayerId = actions[kind];
    if (!targetPlayerId) continue;
    attempts.push({
      kind,
      targetPlayerId,
      prevented: protectedPlayerIds.has(targetPlayerId),
    });
  }
  return attempts;
}

function isPlayerId(value: string | null): value is string {
  return value !== null;
}

function createChecks(
  actions: NightActions,
  assignmentsById: ReadonlyMap<string, RoleAssignment>,
): NightCheckResult[] {
  const checks: NightCheckResult[] = [];
  const donTargetId = actions["don-check"];
  if (donTargetId) {
    checks.push({
      kind: "don-check",
      targetPlayerId: donTargetId,
      positive: assignmentsById.get(donTargetId)?.role === "commissioner",
    });
  }
  const commissionerTargetId = actions["commissioner-check"];
  if (commissionerTargetId) {
    checks.push({
      kind: "commissioner-check",
      targetPlayerId: commissionerTargetId,
      positive: assignmentsById.get(commissionerTargetId)?.team === "mafia",
    });
  }
  return checks;
}
