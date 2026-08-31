import type { NarrationCue } from "../narrationCatalog";

/** Spoken guidance used as the moderator channel during closed-eye play. */
export interface Narrator {
  readonly available: boolean;
  speak(cue: NarrationCue): void;
  cancel(): void;
}

export const SILENT_NARRATOR: Readonly<Narrator> = Object.freeze({
  available: false,
  speak: () => undefined,
  cancel: () => undefined,
});
