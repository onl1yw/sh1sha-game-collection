import type { NarrationCue } from "../../app/narrationCatalog";
import type { Narrator } from "../../app/ports/narrator";
import { SpeechSynthesisNarrator } from "./SpeechSynthesisNarrator";

interface AudioPlayer {
  currentTime: number;
  preload: string;
  volume: number;
  pause(): void;
  play(): Promise<void>;
}

type AudioFactory = (source: string) => AudioPlayer;

export interface RecordedAudioNarratorOptions {
  audioBaseUrl?: string;
  audioFactory?: AudioFactory | null;
  fallback?: Narrator;
  volume?: number;
}

/** Plays checked-in MP3 cues and falls back to browser speech on playback failure. */
export class RecordedAudioNarrator implements Narrator {
  public readonly available: boolean;
  private readonly audioBaseUrl: string;
  private readonly audioFactory: AudioFactory | null;
  private readonly fallback: Narrator;
  private readonly volume: number;
  private currentAudio: AudioPlayer | null = null;
  private playbackVersion = 0;

  public constructor(options: RecordedAudioNarratorOptions = {}) {
    this.audioBaseUrl = withTrailingSlash(
      options.audioBaseUrl ?? `${import.meta.env.BASE_URL}games/mafia/audio/`,
    );
    this.audioFactory = options.audioFactory === undefined
      ? browserAudioFactory()
      : options.audioFactory;
    this.volume = normalizeVolume(options.volume ?? 1);
    this.fallback = options.fallback ?? new SpeechSynthesisNarrator(this.volume);
    this.available = this.audioFactory !== null || this.fallback.available;
  }

  public speak(cue: NarrationCue): void {
    this.cancel();
    if (!this.audioFactory) {
      this.fallback.speak(cue);
      return;
    }

    const version = this.playbackVersion;
    try {
      const audio = this.audioFactory(
        `${this.audioBaseUrl}${encodeURIComponent(cue.clipId)}.mp3`,
      );
      audio.preload = "auto";
      audio.currentTime = 0;
      audio.volume = this.volume;
      this.currentAudio = audio;
      void audio.play().catch(() => this.useFallback(version, cue));
    } catch {
      this.useFallback(version, cue);
    }
  }

  public cancel(): void {
    this.playbackVersion += 1;
    try {
      this.currentAudio?.pause();
      if (this.currentAudio) this.currentAudio.currentTime = 0;
    } catch {
      // A broken media element must not interrupt the game.
    }
    this.currentAudio = null;
    this.fallback.cancel();
  }

  private useFallback(version: number, cue: NarrationCue): void {
    if (version !== this.playbackVersion) return;
    this.currentAudio = null;
    if (this.fallback.available) this.fallback.speak(cue);
  }
}

function browserAudioFactory(): AudioFactory | null {
  return typeof Audio === "undefined" ? null : (source) => new Audio(source);
}

function withTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeVolume(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 1;
}
