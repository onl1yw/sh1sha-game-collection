import catalog from "./narrationCatalog.json";

export type NarrationClipId = keyof typeof catalog;

export interface NarrationCue {
  clipId: NarrationClipId;
  text: string;
}

export function narrationCue(clipId: NarrationClipId): NarrationCue {
  return { clipId, text: catalog[clipId] };
}
