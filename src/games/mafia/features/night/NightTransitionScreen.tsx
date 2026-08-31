import { useEffect } from "react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Card } from "../../../../shared/ui/Card";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { CircularCountdown } from "./CircularCountdown";
import styles from "./NightTransitionScreen.module.css";

export const COUNTDOWN_ZERO_HOLD_MS = 250;

export interface NightTransitionScreenProps {
  nightNumber: number;
  message: string;
  delayMs: number;
  onContinue: () => void;
}

export function NightTransitionScreen({
  nightNumber,
  message,
  delayMs,
  onContinue,
}: NightTransitionScreenProps) {
  useEffect(() => {
    const timer = window.setTimeout(onContinue, delayMs + COUNTDOWN_ZERO_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [delayMs, onContinue]);

  return (
    <AppShell
      ariaLabel={`Ночь ${nightNumber}: переход`}
      actions={<div className={styles.actionPlaceholder} aria-hidden="true" />}
    >
      <ScreenHeader
        eyebrow={`Ночь ${nightNumber}`}
        title="Ночной ход"
        leadingAction={<span className={styles.navigationPlaceholder} aria-hidden="true" />}
      />
      <Card className={styles.card}>
        <p className={styles.message}>{message}</p>
        <CircularCountdown delayMs={delayMs} />
      </Card>
    </AppShell>
  );
}
