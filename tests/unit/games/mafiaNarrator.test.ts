/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from "vitest";

import { SILENT_NARRATOR } from "../../../src/games/mafia/app/ports/narrator";
import { narrationCue } from "../../../src/games/mafia/app/narrationCatalog";
import { SpeechSynthesisNarrator } from "../../../src/games/mafia/infrastructure/audio/SpeechSynthesisNarrator";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SpeechSynthesisNarrator", () => {
  it("prefers an exact Russian voice and cancels previous speech", () => {
    const englishVoice = createVoice("English", "en-US");
    const russianVoice = createVoice("Russian", "ru_RU");
    const synthesis = createSynthesis([englishVoice, russianVoice]);
    vi.stubGlobal("speechSynthesis", synthesis);
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);

    const narrator = new SpeechSynthesisNarrator(0.4);
    expect(narrator.available).toBe(true);
    narrator.speak({ clipId: "mafia-wakes", text: "  Просыпается мафия  " });

    expect(synthesis.cancel).toHaveBeenCalledOnce();
    expect(synthesis.speak).toHaveBeenCalledOnce();
    const utterance = synthesis.speak.mock.calls[0]?.[0] as FakeUtterance;
    expect(utterance.text).toBe("Просыпается мафия");
    expect(utterance.lang).toBe("ru-RU");
    expect(utterance.rate).toBe(0.9);
    expect(utterance.volume).toBe(0.4);
    expect(utterance.voice).toBe(russianVoice);
  });

  it("does nothing when speech synthesis is unavailable", () => {
    vi.stubGlobal("speechSynthesis", undefined);
    vi.stubGlobal("SpeechSynthesisUtterance", undefined);
    const narrator = new SpeechSynthesisNarrator();

    expect(narrator.available).toBe(false);
    expect(SILENT_NARRATOR.available).toBe(false);
    expect(() => narrator.speak(narrationCue("doctor-wakes"))).not.toThrow();
    expect(() => narrator.cancel()).not.toThrow();
    expect(() => SILENT_NARRATOR.speak(narrationCue("lover-sleeps"))).not.toThrow();
  });

  it("contains browser failures instead of interrupting the game", () => {
    const synthesis = createSynthesis([]);
    synthesis.getVoices.mockImplementation(() => {
      throw new Error("Speech engine failed");
    });
    synthesis.speak.mockImplementation(() => {
      throw new Error("Speech engine failed");
    });
    synthesis.cancel.mockImplementation(() => {
      throw new Error("Speech engine failed");
    });
    vi.stubGlobal("speechSynthesis", synthesis);
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
    const narrator = new SpeechSynthesisNarrator();

    expect(() => narrator.speak(narrationCue("night-begins"))).not.toThrow();
    expect(() => narrator.cancel()).not.toThrow();
  });

  it("ignores empty messages", () => {
    const synthesis = createSynthesis([]);
    vi.stubGlobal("speechSynthesis", synthesis);
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);

    new SpeechSynthesisNarrator().speak({ clipId: "night-begins", text: "   " });

    expect(synthesis.cancel).not.toHaveBeenCalled();
    expect(synthesis.speak).not.toHaveBeenCalled();
  });
});

class FakeUtterance {
  public readonly text: string;
  public lang = "";
  public rate = 1;
  public volume = 1;
  public voice: SpeechSynthesisVoice | null = null;

  public constructor(text: string) {
    this.text = text;
  }
}

function createSynthesis(voices: SpeechSynthesisVoice[]) {
  return {
    cancel: vi.fn(),
    getVoices: vi.fn(() => voices),
    speak: vi.fn(),
  };
}

function createVoice(name: string, lang: string): SpeechSynthesisVoice {
  return {
    default: false,
    lang,
    localService: true,
    name,
    voiceURI: name,
  };
}
