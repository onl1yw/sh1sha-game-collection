import { forwardRef, type ButtonHTMLAttributes } from "react";

import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "danger" | "quiet";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    fullWidth = false,
    className,
    type = "button",
    ...buttonProps
  },
  ref,
) {
  const classes = [
    styles.button,
    styles[variant],
    fullWidth ? styles.fullWidth : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button {...buttonProps} className={classes} ref={ref} type={type} />;
});
