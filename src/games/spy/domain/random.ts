export interface RandomSource {
  next(): number;
}

export function randomIndex(length: number, random: RandomSource): number {
  if (!Number.isInteger(length) || length < 1) {
    throw new RangeError("Random selection requires at least one candidate");
  }

  const value = random.next();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError("RandomSource.next() must return a value in [0, 1)");
  }

  return Math.floor(value * length);
}
