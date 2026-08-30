import type { RandomSource } from "../../domain/random";
import type { IntegerRandomSource } from "./RandomSource";

const UINT32_RANGE = 0x1_0000_0000;

type CryptoProvider = Pick<Crypto, "getRandomValues">;

export class CryptoRandomSource
  implements RandomSource, IntegerRandomSource
{
  public constructor(
    private readonly cryptoProvider: CryptoProvider = globalThis.crypto,
  ) {
    if (!cryptoProvider?.getRandomValues) {
      throw new Error("Secure random numbers are not available");
    }
  }

  public next(): number {
    return this.readUint32() / UINT32_RANGE;
  }

  public nextInt(maxExclusive: number): number {
    if (
      !Number.isSafeInteger(maxExclusive) ||
      maxExclusive <= 0 ||
      maxExclusive > UINT32_RANGE
    ) {
      throw new RangeError(
        `maxExclusive must be an integer between 1 and ${UINT32_RANGE}`,
      );
    }

    // Reject the incomplete tail instead of applying `%` to the whole range.
    const acceptedRange = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive;
    let value = this.readUint32();

    while (value >= acceptedRange) {
      value = this.readUint32();
    }

    return value % maxExclusive;
  }

  private readUint32(): number {
    const buffer = new Uint32Array(1);
    this.cryptoProvider.getRandomValues(buffer);
    return buffer[0] ?? 0;
  }
}
