import { useEffect, useRef, type ReactNode } from "react";

import styles from "./AppShell.module.css";

export interface AppShellProps {
  children: ReactNode;
  actions?: ReactNode;
  ariaLabel?: string;
}

export function AppShell({ children, actions, ariaLabel }: AppShellProps) {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.focus();
  }, []);

  return (
    <div className={styles.viewport}>
      <main
        ref={mainRef}
        className={styles.content}
        aria-label={ariaLabel}
        tabIndex={-1}
      >
        {children}
      </main>
      {actions ? <footer className={styles.actions}>{actions}</footer> : null}
    </div>
  );
}
