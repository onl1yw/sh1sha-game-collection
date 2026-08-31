import type { HTMLAttributes } from "react";

import styles from "./BarSurface.module.css";

export type ActionBarProps = HTMLAttributes<HTMLElement>;

export function ActionBar({ children, className, ...props }: ActionBarProps) {
  const classes = [styles.surface, styles.bottom, className]
    .filter(Boolean)
    .join(" ");
  return (
    <footer {...props} className={classes} data-ui="action-bar">
      <span className={styles.backdrop} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
    </footer>
  );
}
