import { Check, X } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent,
} from "react";

import type { HatWord } from "../../domain/types";
import styles from "./HatWordCard.module.css";

export type HatWordOutcome = "correct" | "skipped";

export interface HatWordCardHandle {
  exit: (outcome: HatWordOutcome) => void;
}

export interface HatWordCardProps {
  word: HatWord;
  prompt: string;
  disabled?: boolean;
  onOutcome: (outcome: HatWordOutcome) => void;
  onTransitionChange?: (transitioning: boolean) => void;
}

export const HatWordCard = forwardRef<HatWordCardHandle, HatWordCardProps>(function HatWordCard(
  {
    word,
    prompt,
    disabled = false,
    onOutcome,
    onTransitionChange,
  },
  ref,
) {
  const originRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const exitOutcomeRef = useRef<HatWordOutcome | null>(null);
  const [offset, setOffset] = useState(0);
  const [exitOutcome, setExitOutcome] = useState<HatWordOutcome | null>(null);
  const [exitingWord, setExitingWord] = useState<HatWord | null>(null);
  const displayedWord = exitingWord ?? word;

  const startExit = useCallback((outcome: HatWordOutcome) => {
    if (disabled || exitOutcomeRef.current) return;
    originRef.current = null;
    exitOutcomeRef.current = outcome;
    setExitingWord(word);
    setExitOutcome(outcome);
    onTransitionChange?.(true);
  }, [disabled, onTransitionChange, word]);

  useImperativeHandle(ref, () => ({ exit: startExit }), [startExit]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || exitOutcome) return;
    originRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (originRef.current === null || disabled) return;
    const nextOffset = event.clientX - originRef.current;
    offsetRef.current = nextOffset;
    setOffset(nextOffset);
  };
  const finishPointer = () => {
    if (disabled) {
      resetPointer();
      return;
    }
    const outcome = swipeOutcome(offsetRef.current);
    originRef.current = null;
    if (!outcome) {
      resetPointer();
      return;
    }
    startExit(outcome);
  };
  const resetPointer = () => {
    originRef.current = null;
    offsetRef.current = 0;
    setOffset(0);
  };
  const finishExit = () => {
    const outcome = exitOutcomeRef.current;
    if (!outcome) return;
    exitOutcomeRef.current = null;
    setExitOutcome(null);
    setExitingWord(null);
    resetPointer();
    onTransitionChange?.(false);
    onOutcome(outcome);
  };

  const direction = offset > 8 ? "correct" : offset < -8 ? "skipped" : "idle";
  const visualDirection = exitOutcome ?? direction;
  return (
    <div
      className={styles.card}
      data-direction={visualDirection}
      data-exiting={exitOutcome ?? undefined}
      data-disabled={disabled || undefined}
      role="group"
      aria-disabled={disabled}
      aria-label={`${displayedWord.text}. Смахните влево для пропуска или вправо, если слово угадано`}
      style={{ translate: `${offset}px 0`, rotate: `${offset / 30}deg` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={resetPointer}
      onAnimationEnd={finishExit}
    >
      <span className={styles.feedback} aria-hidden="true">
        {visualDirection === "correct" ? <Check size={42} /> : null}
        {visualDirection === "skipped" ? <X size={42} /> : null}
      </span>
      <p>{prompt}</p>
      <strong aria-atomic="true" aria-live="polite">{displayedWord.text}</strong>
    </div>
  );
});

function swipeOutcome(offset: number): HatWordOutcome | null {
  if (offset >= 64) return "correct";
  if (offset <= -64) return "skipped";
  return null;
}
