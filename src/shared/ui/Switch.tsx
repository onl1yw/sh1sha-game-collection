import type { ButtonHTMLAttributes } from "react";

import styles from "./Switch.module.css";

export interface SwitchProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "onChange" | "onClick" | "role"
  > {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}

export function Switch({
  checked,
  className,
  label,
  onCheckedChange,
  type = "button",
  ...buttonProps
}: SwitchProps) {
  const classes = [styles.root, className].filter(Boolean).join(" ");
  return (
    <button
      {...buttonProps}
      className={classes}
      type={type}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      data-checked={checked}
      onClick={() => onCheckedChange(!checked)}
    >
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </button>
  );
}
