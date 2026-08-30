import type { HTMLAttributes } from "react";

import styles from "./SectionLabel.module.css";

export type SectionLabelProps = HTMLAttributes<HTMLHeadingElement>;

export function SectionLabel({ className, ...headingProps }: SectionLabelProps) {
  const classes = [styles.label, className].filter(Boolean).join(" ");
  return <h2 {...headingProps} className={classes} />;
}
