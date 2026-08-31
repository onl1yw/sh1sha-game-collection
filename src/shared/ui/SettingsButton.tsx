import { Settings } from "lucide-react";

import { Button, type ButtonProps } from "./Button";
import styles from "./SettingsButton.module.css";

export interface SettingsButtonProps
  extends Omit<ButtonProps, "children" | "variant"> {
  showLabel?: boolean;
}

export function SettingsButton({
  "aria-label": ariaLabel,
  className,
  showLabel = false,
  ...buttonProps
}: SettingsButtonProps) {
  const classes = [styles.button, className].filter(Boolean).join(" ");
  return (
    <Button
      {...buttonProps}
      className={classes}
      variant="quiet"
      aria-label={ariaLabel ?? (showLabel ? undefined : "Настройки")}
    >
      <Settings aria-hidden="true" focusable="false" size={22} strokeWidth={1.8} />
      {showLabel ? "Настройки" : null}
    </Button>
  );
}
