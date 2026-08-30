import type { RandomSource } from "../../domain/random";

export type { RandomSource } from "../../domain/random";

/** Optional capability for consumers that need an unbiased integer. */
export interface IntegerRandomSource extends RandomSource {
  nextInt(maxExclusive: number): number;
}
