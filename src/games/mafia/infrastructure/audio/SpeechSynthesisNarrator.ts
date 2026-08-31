import type { Narrator } from "../../app/ports/narrator";
import type { NarrationCue } from "../../app/narrationCatalog";

const RUSSIAN_LANGUAGE = "ru-RU";
const SPEECH_RATE = 0.9;

/** Browser speech adapter whose availability gates the closed-eye flow. */
export class SpeechSynthesisNarrator implements Narrator {
  public readonly available: boolean;
  private readonly synthesis: SpeechSynthesis | null;
  private readonly volume: number;

  public constructor(volume = 1) {
    this.synthesis = browserSpeechSynthesis();
    this.volume = Math.min(1, Math.max(0, volume));
    this.available = this.synthesis !== null && supportsUtterances();
  }

  public speak(cue: NarrationCue): void {
    const text = cue.text.trim();
    if (!text || !this.synthesis || !this.available) return;

    this.cancel();
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = RUSSIAN_LANGUAGE;
      utterance.rate = SPEECH_RATE;
      utterance.volume = this.volume;
      utterance.voice = preferredRussianVoice(this.synthesis);
      this.synthesis.speak(utterance);
    } catch {
      // Contain a broken speech engine without crashing the game shell.
    }
  }

  public cancel(): void {
    try {
      this.synthesis?.cancel();
    } catch {
      // A broken browser speech engine must not interrupt the game.
    }
  }
}

function browserSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  try {
    return window.speechSynthesis ?? null;
  } catch {
    return null;
  }
}

function supportsUtterances(): boolean {
  return typeof SpeechSynthesisUtterance !== "undefined";
}

function preferredRussianVoice(
  synthesis: SpeechSynthesis,
): SpeechSynthesisVoice | null {
  let voices: SpeechSynthesisVoice[];
  try {
    voices = synthesis.getVoices();
  } catch {
    return null;
  }

  return voices.find((voice) => normalizedLanguage(voice.lang) === "ru-ru")
    ?? voices.find((voice) => normalizedLanguage(voice.lang).startsWith("ru"))
    ?? null;
}

function normalizedLanguage(language: string): string {
  return language.trim().toLowerCase().replaceAll("_", "-");
}
