import { useEffect, useRef, useState } from "react";

export function useRoundTimer(durationSeconds: number, onExpire: () => void): number {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const deadline = performance.now() + durationSeconds * 1000;
    expiredRef.current = false;
    const update = () => {
      const remaining = Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current();
      }
    };
    const interval = window.setInterval(update, 200);
    return () => window.clearInterval(interval);
  }, [durationSeconds]);

  return remainingSeconds;
}
