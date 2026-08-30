import { useEffect, useState } from "react";

import styles from "./ElapsedTimer.module.css";

const TICK_MS = 1_000;

interface ElapsedTimerProps {
  startedAtMs?: number;
}

export function ElapsedTimer({ startedAtMs }: ElapsedTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const effectiveStartedAtMs = startedAtMs ?? Date.now();
    const update = () => {
      setElapsedSeconds(Math.max(
        0,
        Math.floor((Date.now() - effectiveStartedAtMs) / TICK_MS),
      ));
    };
    update();
    const interval = window.setInterval(() => {
      update();
    }, TICK_MS);
    return () => window.clearInterval(interval);
  }, [startedAtMs]);

  return (
    <div className={styles.timer} aria-label="Время раунда">
      <span className={styles.label}>Раунд идёт</span>
      <time className={styles.value} dateTime={`PT${elapsedSeconds}S`}>
        {formatElapsedTime(elapsedSeconds)}
      </time>
    </div>
  );
}

function formatElapsedTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  const tail = `${pad(minutes)}:${pad(seconds)}`;
  return hours > 0 ? `${hours}:${tail}` : tail;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
