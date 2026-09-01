import { useEffect, useRef, useState } from "react";

export function useRoundTimer(
  durationSeconds: number,
  onExpire: () => void,
  paused = false,
): number {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);
  const durationRef = useRef(durationSeconds);
  const remainingMsRef = useRef(durationSeconds * 1000);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (durationRef.current !== durationSeconds) {
      durationRef.current = durationSeconds;
      remainingMsRef.current = durationSeconds * 1000;
      expiredRef.current = false;
      setRemainingSeconds(durationSeconds);
    }
    if (paused) {
      setRemainingSeconds(Math.ceil(remainingMsRef.current / 1000));
      return;
    }

    const deadline = performance.now() + remainingMsRef.current;
    const update = () => {
      const remaining = Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current();
      }
    };
    const interval = window.setInterval(update, 200);
    return () => {
      remainingMsRef.current = Math.max(0, deadline - performance.now());
      window.clearInterval(interval);
    };
  }, [durationSeconds, paused]);

  return remainingSeconds;
}
