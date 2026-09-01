import { useId, useLayoutEffect, useRef, type KeyboardEvent } from "react";

import styles from "./NumberField.module.css";

export interface NumberFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  compact?: boolean;
  placeholder?: string;
  showValue?: boolean;
  selected?: boolean;
  onChange: (value: number) => void;
}

export function NumberField({
  label,
  value,
  min,
  max,
  compact = false,
  placeholder,
  showValue = true,
  selected = false,
  onChange,
}: NumberFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = showValue ? String(value) : "";
    }
  }, [showValue, value]);

  const commit = () => {
    const input = inputRef.current;
    if (!input) return;
    const parsed = input.valueAsNumber;
    const next = Number.isFinite(parsed)
      ? Math.min(max, Math.max(min, Math.round(parsed)))
      : value;
    input.value = showValue ? String(next) : "";
    if (next !== value) onChange(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") event.currentTarget.blur();
  };

  return (
    <label
      className={styles.root}
      data-compact={compact}
      data-selected={selected}
      htmlFor={id}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.inputWrap}>
        <input
          ref={inputRef}
          className={styles.input}
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          defaultValue={showValue ? value : undefined}
          placeholder={placeholder}
          onBlur={commit}
          onKeyDown={handleKeyDown}
        />
      </span>
    </label>
  );
}
