import { readdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import catalog from "../../../src/games/mafia/app/narrationCatalog.json";

const audioDirectory = resolve("public/games/mafia/audio");

describe("Mafia recorded narration catalog", () => {
  it("has one non-empty MP3 asset for every semantic cue", async () => {
    const expectedFiles = Object.keys(catalog).map((id) => `${id}.mp3`).sort();
    const actualFiles = (await readdir(audioDirectory))
      .filter((file) => file.endsWith(".mp3"))
      .sort();

    expect(actualFiles).toEqual(expectedFiles);
    for (const file of actualFiles) {
      expect((await stat(resolve(audioDirectory, file))).size).toBeGreaterThan(1_000);
    }
  });

  it("records reproducible provider metadata without a credential", async () => {
    const metadata = JSON.parse(
      await readFile(resolve(audioDirectory, "metadata.json"), "utf8"),
    ) as Record<string, unknown>;

    expect(metadata).toMatchObject({
      provider: "ElevenLabs",
      voiceId: "13Cuh3NuYvWOVQtLbRN8",
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
    });
    expect(JSON.stringify(metadata)).not.toContain("API_KEY");
    expect(JSON.stringify(metadata)).not.toContain("sk_");
  });
});
