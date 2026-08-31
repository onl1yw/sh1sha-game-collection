import { useRef, useState, type PointerEvent } from "react";

import type { AliasWord } from "../../domain/types";
import styles from "./WordCard.module.css";

export interface WordCardProps {
  word: AliasWord;
  onSwipe: () => void;
}

export function WordCard({ word, onSwipe }: WordCardProps) {
  const originRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const [offset, setOffset] = useState(0);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
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
    const shouldSkip = Math.abs(offsetRef.current) >= 64;
    resetPointer();
    if (shouldSkip) onSwipe();
  };
  const resetPointer = () => {
    originRef.current = null;
    offsetRef.current = 0;
    setOffset(0);
  };

  return (
    <div
      className={styles.card}
      style={{ translate: `${offset}px 0`, rotate: `${offset / 30}deg` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={resetPointer}
    >
      <p>Объясните слово</p>
      <strong>{word.text}</strong>
      <span>Смахните, чтобы пропустить</span>
    </div>
  );
}
