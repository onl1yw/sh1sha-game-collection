import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./InteractiveCard.module.css";

export interface InteractiveCardProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "title"> {
  Icon: LucideIcon;
  title: string;
  description?: string;
  iconTone?: "accent" | "danger";
  trailing?: ReactNode;
}

export function InteractiveCard({
  Icon,
  title,
  description,
  iconTone = "accent",
  trailing,
  className,
  type = "button",
  ...buttonProps
}: InteractiveCardProps) {
  const classes = [
    styles.card,
    trailing ? styles.withTrailing : undefined,
    className,
  ].filter(Boolean).join(" ");

  return (
    <button {...buttonProps} className={classes} type={type}>
      <span
        className={`${styles.icon} ${iconTone === "danger" ? styles.iconDanger : ""}`}
        aria-hidden="true"
        data-icon-tone={iconTone}
      >
        <Icon focusable="false" size={28} strokeWidth={1.8} />
      </span>
      <span className={styles.copy}>
        <span className={styles.title}>{title}</span>
        {description ? (
          <span className={styles.description}>{description}</span>
        ) : null}
      </span>
      {trailing ? <span className={styles.trailing}>{trailing}</span> : null}
    </button>
  );
}
