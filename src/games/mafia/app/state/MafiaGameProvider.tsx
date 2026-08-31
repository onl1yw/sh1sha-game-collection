import {
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import { narrationForState } from "../narration";
import type { Narrator } from "../ports/narrator";
import { RecordedAudioNarrator } from "../../infrastructure/audio/RecordedAudioNarrator";
import { CryptoRandomSource } from "../../infrastructure/random/CryptoRandomSource";
import { MafiaGameContext } from "./gameContext";
import { mafiaGameReducer } from "./gameReducer";
import { createInitialGameState } from "./gameState";
import { useMafiaCommands } from "./useMafiaCommands";

export interface MafiaGameProviderProps {
  children: ReactNode;
  narrator?: Narrator;
  soundEnabled: boolean;
  soundVolume: number;
}

export function MafiaGameProvider({
  children,
  narrator: suppliedNarrator,
  soundEnabled,
  soundVolume,
}: MafiaGameProviderProps) {
  const narrator = useMemo(
    () => suppliedNarrator ?? new RecordedAudioNarrator({ volume: soundVolume }),
    [soundVolume, suppliedNarrator],
  );
  const random = useMemo(() => new CryptoRandomSource(), []);
  const [state, dispatch] = useReducer(mafiaGameReducer, undefined, createInitialGameState);
  const actions = useMafiaCommands({ state, dispatch, random });
  const narration = narrationForState(state);
  const narrationClipId = narration?.clipId ?? null;
  const narrationText = narration?.text ?? null;
  const narrationAudible = soundEnabled
    && Number.isFinite(soundVolume)
    && soundVolume > 0
    && narrator.available;

  useEffect(() => {
    if (!narrationAudible) {
      narrator.cancel();
      return;
    }
    if (narrationClipId && narrationText) {
      narrator.speak({ clipId: narrationClipId, text: narrationText });
    }
  }, [narrationAudible, narrationClipId, narrationText, narrator]);

  useEffect(() => () => narrator.cancel(), [narrator]);

  const value = useMemo(() => ({
    state,
    actions,
    narrationAvailable: narrator.available,
    narrationAudible,
  }), [actions, narrationAudible, narrator.available, state]);
  return <MafiaGameContext.Provider value={value}>{children}</MafiaGameContext.Provider>;
}
