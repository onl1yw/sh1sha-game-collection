import { Check, X } from "lucide-react";
import { useRef, useState, type PointerEvent } from "react";

import type { AliasWord, WordOutcome } from "../../domain/types";
import styles from "./WordCard.module.css";

export interface WordCardProps {
  word: AliasWord;
  onSwipe: (outcome: WordOutcome) => void;
  onTransitionChange?: (transitioning: boolean) => void;
}

export function WordCard({ word, onSwipe, onTransitionChange }: WordCardProps) {
  const originRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const [offset, setOffset] = useState(0);
  const [exitOutcome, setExitOutcome] = useState<WordOutcome | null>(null);
  const [exitingWord, setExitingWord] = useState<AliasWord | null>(null);
  const displayedWord = exitingWord ?? word;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (exitOutcome) return;
    originRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (originRef.current === null) return;
    const nextOffset = event.clientX - originRef.current;
    offsetRef.current = nextOffset;
    setOffset(nextOffset);
  };
  const finishPointer = () => {
    const outcome = swipeOutcome(offsetRef.current);
    originRef.current = null;
    if (outcome) {
      setExitingWord(word);
      setExitOutcome(outcome);
      onTransitionChange?.(true);
      onSwipe(outcome);
      return;
    }
    resetPointer();
  };
  const resetPointer = () => {
    originRef.current = null;
    offsetRef.current = 0;
    setOffset(0);
  };
  const finishExit = () => {
    if (!exitOutcome) return;
    setExitOutcome(null);
    setExitingWord(null);
    resetPointer();
    onTransitionChange?.(false);
  };

  const direction = offset > 8 ? "correct" : offset < -8 ? "skipped" : "idle";

  return (
    <div
      className={styles.card}
      data-direction={exitOutcome ?? direction}
      data-exiting={exitOutcome ?? undefined}
      role="group"
      aria-label={`${displayedWord.text}. Смахните влево для пропуска или вправо, если слово угадано`}
      style={{ translate: `${offset}px 0`, rotate: `${offset / 30}deg` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={resetPointer}
      onAnimationEnd={finishExit}
    >
      <span className={styles.feedback} aria-hidden="true">
        {direction === "correct" ? <Check size={42} /> : null}
        {direction === "skipped" ? <X size={42} /> : null}
      </span>
      <p>Объясните слово</p>
      <strong>{displayedWord.text}</strong>
    </div>
  );
}

function swipeOutcome(offset: number): WordOutcome | null {
  if (offset >= 64) return "correct";
  if (offset <= -64) return "skipped";
  return null;
}
