import type { RandomSource } from "../random";

export function minimumKnownCount(
  counts: readonly (number | undefined)[],
): number {
  let minimum: number | undefined;
  counts.forEach((count) => {
    if (count !== undefined && (minimum === undefined || count < minimum)) {
      minimum = count;
    }
  });
  return minimum ?? 0;
}

export function calculateFairWeight(
  assignments: number,
  lastRound: number | null,
  roundNumber: number,
  minimumAssignments: number,
): number {
  const countDifference = Math.max(0, assignments - minimumAssignments);
  const assignmentFactor = 1 / (1 + countDifference * 1.5);

  if (lastRound === null) return assignmentFactor * 1.8;
  const roundsSince = Math.max(0, roundNumber - lastRound);
  const recencyFactors = [0.12, 0.28, 0.55, 0.8];
  const recencyFactor =
    recencyFactors[roundsSince] ??
    1 + Math.min(roundsSince - 3, 5) * 0.1;
  return assignmentFactor * recencyFactor;
}

export function selectWeightedIndex(
  weights: readonly number[],
  random: RandomSource,
): number {
  if (weights.length === 0 || weights.some((weight) => weight <= 0)) {
    throw new RangeError("Weighted selection requires positive weights");
  }

  const value = random.next();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError("RandomSource.next() must return a value in [0, 1)");
  }

  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const threshold = value * total;
  let cumulative = 0;
  for (let index = 0; index < weights.length; index += 1) {
    cumulative += weights[index] ?? 0;
    if (threshold < cumulative) return index;
  }
  return weights.length - 1;
}
