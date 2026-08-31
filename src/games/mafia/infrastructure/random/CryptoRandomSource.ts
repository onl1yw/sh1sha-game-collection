import type { RandomSource } from "../../domain/random";

const UINT32_RANGE = 0x1_0000_0000;

export class CryptoRandomSource implements RandomSource {
  next(): number {
    const cryptoApi = globalThis.crypto;
    if (!cryptoApi?.getRandomValues) return Math.random();
    const value = new Uint32Array(1);
    cryptoApi.getRandomValues(value);
    return (value[0] ?? 0) / UINT32_RANGE;
  }
}
