import type { InputHTMLAttributes } from "react";

import styles from "./RangeField.module.css";

export interface RangeFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "type" | "value"
  > {
  label: string;
  value: number;
  valueText?: string;
  onValueChange: (value: number) => void;
}

export function RangeField({
  id,
  label,
  value,
  valueText = String(value),
  onValueChange,
  ...inputProps
}: RangeFieldProps) {
  return (
    <label className={styles.root} htmlFor={id}>
      <span className={styles.header}>
        <span>{label}</span>
        <output className={styles.value}>{valueText}</output>
      </span>
      <input
        {...inputProps}
        id={id}
        className={styles.input}
        type="range"
        value={value}
        aria-valuetext={valueText}
        onChange={(event) => onValueChange(event.currentTarget.valueAsNumber)}
      />
    </label>
  );
}
