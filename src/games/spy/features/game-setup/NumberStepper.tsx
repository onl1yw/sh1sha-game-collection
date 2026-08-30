import { Button } from "../../../../shared/ui/Button";
import styles from "./NumberStepper.module.css";

export interface NumberStepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  hint?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function NumberStepper({
  label,
  value,
  min,
  max,
  hint,
  disabled = false,
  onChange,
}: NumberStepperProps) {
  return (
    <div className={styles.root} role="group" aria-label={label}>
      <div className={styles.copy}>
        <span className={styles.label}>{label}</span>
        {hint ? <span className={styles.hint}>{hint}</span> : null}
      </div>
      <div className={styles.controls}>
        <Button
          className={styles.control}
          variant="secondary"
          aria-label={`Уменьшить: ${label}`}
          disabled={disabled || value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <span aria-hidden="true">−</span>
        </Button>
        <output className={styles.value} aria-live="polite">
          {value}
        </output>
        <Button
          className={styles.control}
          variant="secondary"
          aria-label={`Увеличить: ${label}`}
          disabled={disabled || value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <span aria-hidden="true">+</span>
        </Button>
      </div>
    </div>
  );
}
