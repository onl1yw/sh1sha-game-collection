import type { HTMLAttributes } from "react";

import styles from "./Card.module.css";

export type CardTone = "default" | "accent" | "danger";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
}

export function Card({
  tone = "default",
  className,
  ...cardProps
}: CardProps) {
  const classes = [styles.card, styles[tone], className]
    .filter(Boolean)
    .join(" ");

  return <div {...cardProps} className={classes} />;
}
