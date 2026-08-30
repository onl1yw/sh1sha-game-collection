import { useId } from "react";

import styles from "./SpyModeSelector.module.css";

export type SpyModeValue = "classic" | "decoy";

export interface SpyModeSelectorProps {
  value: SpyModeValue;
  disabled?: boolean;
  onChange: (mode: SpyModeValue) => void;
}

const modes: ReadonlyArray<{
  value: SpyModeValue;
  title: string;
  description: string;
}> = [
  {
    value: "classic",
    title: "Шпион знает свою роль",
    description: "Шпион увидит только сообщение о своей роли и не получит объект.",
  },
  {
    value: "decoy",
    title: "Шпион получает другое слово",
    description: "Все увидят слово. Шпион не узнает, что его объект отличается.",
  },
];

export function SpyModeSelector({
  value,
  disabled = false,
  onChange,
}: SpyModeSelectorProps) {
  const groupName = useId();

  return (
    <fieldset className={styles.root} disabled={disabled}>
      <legend className={styles.legend}>Режим шпиона</legend>
      <div className={styles.options}>
        {modes.map((mode) => (
          <label className={styles.option} key={mode.value}>
            <input
              className={styles.radio}
              type="radio"
              name={groupName}
              value={mode.value}
              checked={value === mode.value}
              onChange={() => onChange(mode.value)}
            />
            <span className={styles.indicator} aria-hidden="true" />
            <span className={styles.copy}>
              <span className={styles.title}>{mode.title}</span>
              <span className={styles.description}>{mode.description}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
