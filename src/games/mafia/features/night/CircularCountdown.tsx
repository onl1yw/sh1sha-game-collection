import { useEffect, useState, type CSSProperties } from "react";

import styles from "./CircularCountdown.module.css";

const SECOND_MS = 1000;

export interface CircularCountdownProps {
  delayMs: number;
  countFrom?: number;
}

export function CircularCountdown({
  delayMs,
  countFrom = 3,
}: CircularCountdownProps) {
  const safeDelayMs = Math.max(0, delayMs);
  const safeCountFrom = Math.max(1, Math.floor(countFrom));
  const [timerState, setTimerState] = useState({
    delayMs: safeDelayMs,
    remainingMs: safeDelayMs,
  });
  const remainingMs = timerState.delayMs === safeDelayMs
    ? timerState.remainingMs
    : safeDelayMs;
  const countdownDurationMs = Math.min(safeDelayMs, safeCountFrom * SECOND_MS);
  const countdownDelayMs = Math.max(0, safeDelayMs - countdownDurationMs);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimerState((current) => ({
        delayMs: safeDelayMs,
        remainingMs: Math.max(
          0,
          (current.delayMs === safeDelayMs ? current.remainingMs : safeDelayMs)
            - SECOND_MS,
        ),
      }));
    }, SECOND_MS);
    return () => window.clearInterval(timer);
  }, [safeDelayMs]);

  const remainingSeconds = Math.max(0, Math.ceil(remainingMs / SECOND_MS));
  const visible = safeDelayMs > 0 && remainingSeconds <= safeCountFrom;
  const visibleValue = Math.min(remainingSeconds, safeCountFrom);
  const progressOffset = 100 - (visibleValue / safeCountFrom) * 100;
  const timerStyle = {
    "--countdown-delay": `${countdownDelayMs}ms`,
    "--countdown-duration": `${countdownDurationMs}ms`,
  } as CSSProperties;

  return (
    <div
      className={styles.timer}
      data-countdown-visible={visible}
      aria-hidden={!visible}
      aria-label="Отсчёт перед продолжением ночи"
      aria-live="off"
      role="timer"
      style={timerStyle}
    >
      <svg className={styles.ring} viewBox="0 0 120 120" aria-hidden="true">
        <circle className={styles.track} cx="60" cy="60" r="52" pathLength="100" />
        <circle
          className={styles.progress}
          cx="60"
          cy="60"
          r="52"
          pathLength="100"
          strokeDashoffset={progressOffset}
        />
      </svg>
      <strong className={styles.value} aria-hidden="true">
        {visibleValue}
      </strong>
    </div>
  );
}
