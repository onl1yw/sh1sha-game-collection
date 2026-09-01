import { useId } from "react";

import styles from "./TeamNamesFieldset.module.css";

export interface TeamNameItem {
  id: string;
  name: string;
}

export interface TeamNamesFieldsetProps {
  teams: readonly TeamNameItem[];
  onRename: (teamId: string, name: string) => void;
  legend?: string;
  labelForIndex?: (index: number) => string;
  placeholderForIndex?: (index: number) => string;
  maxLength?: number;
}

const defaultTeamLabel = (index: number) => `Команда ${index + 1}`;

export function TeamNamesFieldset({
  teams,
  onRename,
  legend = "Названия команд",
  labelForIndex = defaultTeamLabel,
  placeholderForIndex = defaultTeamLabel,
  maxLength = 32,
}: TeamNamesFieldsetProps) {
  const groupId = useId();
  return (
    <fieldset className={styles.root}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.list}>
        {teams.map((team, index) => {
          const inputId = `${groupId}-${index}`;
          return (
            <label className={styles.field} htmlFor={inputId} key={team.id}>
              <span className={styles.label}>{labelForIndex(index)}</span>
              <input
                className={styles.input}
                id={inputId}
                type="text"
                autoComplete="off"
                maxLength={maxLength}
                placeholder={placeholderForIndex(index)}
                value={team.name}
                onChange={(event) => onRename(team.id, event.target.value)}
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
