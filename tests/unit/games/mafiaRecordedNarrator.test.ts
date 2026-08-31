import { describe, expect, it, vi } from "vitest";

import { narrationCue } from "../../../src/games/mafia/app/narrationCatalog";
import type { Narrator } from "../../../src/games/mafia/app/ports/narrator";
import { RecordedAudioNarrator } from "../../../src/games/mafia/infrastructure/audio/RecordedAudioNarrator";

describe("RecordedAudioNarrator", () => {
  it("plays the checked-in MP3 for a semantic narration cue", () => {
    const player = fakeAudio();
    const audioFactory = vi.fn(() => player);
    const fallback = fakeNarrator(false);
    const narrator = new RecordedAudioNarrator({
      audioBaseUrl: "/assets/mafia",
      audioFactory,
      fallback,
      volume: 0.35,
    });

    expect(narrator.available).toBe(true);
    narrator.speak(narrationCue("mafia-wakes"));

    expect(audioFactory).toHaveBeenCalledWith("/assets/mafia/mafia-wakes.mp3");
    expect(player.preload).toBe("auto");
    expect(player.volume).toBe(0.35);
    expect(player.play).toHaveBeenCalledOnce();
    expect(fallback.speak).not.toHaveBeenCalled();

    narrator.cancel();
    expect(player.pause).toHaveBeenCalledOnce();
    expect(player.currentTime).toBe(0);
  });

  it("falls back to browser speech when recorded playback fails", async () => {
    const player = fakeAudio();
    player.play.mockRejectedValue(new Error("Autoplay rejected"));
    const fallback = fakeNarrator(true);
    const narrator = new RecordedAudioNarrator({
      audioFactory: () => player,
      fallback,
    });
    const cue = narrationCue("doctor-wakes");

    narrator.speak(cue);
    await Promise.resolve();

    expect(fallback.speak).toHaveBeenCalledWith(cue);
  });

  it("uses browser speech directly when the Audio API is unavailable", () => {
    const fallback = fakeNarrator(true);
    const narrator = new RecordedAudioNarrator({
      audioFactory: null,
      fallback,
    });
    const cue = narrationCue("voting");

    expect(narrator.available).toBe(true);
    narrator.speak(cue);

    expect(fallback.speak).toHaveBeenCalledWith(cue);
  });
});

function fakeAudio() {
  return {
    currentTime: 3,
    preload: "none",
    volume: 1,
    pause: vi.fn(),
    play: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  };
}

function fakeNarrator(available: boolean): Narrator {
  return {
    available,
    speak: vi.fn(),
    cancel: vi.fn(),
  };
}
