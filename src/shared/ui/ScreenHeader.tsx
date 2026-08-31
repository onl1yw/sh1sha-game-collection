import type { ReactNode } from "react";

import { AppBar } from "./AppBar";
import { Button } from "./Button";
import styles from "./ScreenHeader.module.css";

export interface ScreenHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  backLabel?: string;
  leadingAction?: ReactNode;
  trailingAction?: ReactNode;
  onBack?: () => void;
}

export function ScreenHeader({
  title,
  description,
  eyebrow,
  backLabel = "Назад",
  leadingAction,
  trailingAction,
  onBack,
}: ScreenHeaderProps) {
  const leading = leadingAction ?? (onBack ? (
    <Button className={styles.back} variant="quiet" onClick={onBack}>
      <span aria-hidden="true">←</span> {backLabel}
    </Button>
  ) : null);

  return (
    <AppBar>
      <header className={styles.header}>
        {leading || trailingAction ? (
          <div className={styles.navigation}>
            <div className={styles.leading}>{leading}</div>
            <div className={styles.trailing}>{trailingAction}</div>
          </div>
        ) : null}
        <div className={styles.copy}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={styles.title}>{title}</h1>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </div>
      </header>
    </AppBar>
  );
}
