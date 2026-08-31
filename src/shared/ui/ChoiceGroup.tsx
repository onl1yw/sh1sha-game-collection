import { useId } from "react";

import styles from "./ChoiceGroup.module.css";

export interface ChoiceOption<Value extends string> {
  value: Value;
  title: string;
  description?: string;
}

export interface ChoiceGroupProps<Value extends string> {
  legend: string;
  value: Value;
  options: readonly ChoiceOption<Value>[];
  disabled?: boolean;
  onChange: (value: Value) => void;
}

export function ChoiceGroup<Value extends string>({
  legend,
  value,
  options,
  disabled = false,
  onChange,
}: ChoiceGroupProps<Value>) {
  const groupName = useId();

  return (
    <fieldset className={styles.root} disabled={disabled}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label className={styles.option} key={option.value}>
            <input
              className={styles.radio}
              type="radio"
              name={groupName}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span className={styles.indicator} aria-hidden="true" />
            <span className={styles.copy}>
              <span className={styles.title}>{option.title}</span>
              {option.description ? (
                <span className={styles.description}>{option.description}</span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
