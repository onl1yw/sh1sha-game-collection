import { useEffect, useRef, useState } from "react";

export function useTurnTimer(
  durationMs: number,
  onExpire: () => void,
  paused = false,
): number {
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);
  const durationRef = useRef(durationMs);
  const remainingRef = useRef(durationMs);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (durationRef.current !== durationMs) {
      durationRef.current = durationMs;
      remainingRef.current = durationMs;
      expiredRef.current = false;
      setRemainingMs(durationMs);
    }
    if (paused) {
      setRemainingMs(remainingRef.current);
      return;
    }

    const deadline = performance.now() + remainingRef.current;
    const update = () => {
      const remaining = Math.max(0, Math.ceil(deadline - performance.now()));
      remainingRef.current = remaining;
      setRemainingMs(remaining);
      if (remaining === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current();
      }
    };
    const interval = window.setInterval(update, 100);
    return () => {
      remainingRef.current = Math.max(0, Math.ceil(deadline - performance.now()));
      window.clearInterval(interval);
    };
  }, [durationMs, paused]);

  return remainingMs;
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
