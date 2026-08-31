import type { HTMLAttributes } from "react";

import styles from "./BarSurface.module.css";

export type AppBarProps = HTMLAttributes<HTMLDivElement>;

export function AppBar({ children, className, ...props }: AppBarProps) {
  const classes = [styles.surface, styles.top, className]
    .filter(Boolean)
    .join(" ");
  return (
    <div {...props} className={classes} data-ui="app-bar">
      <span className={styles.backdrop} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
