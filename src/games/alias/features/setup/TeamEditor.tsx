import { useId } from "react";

import type { AliasTeam } from "../../domain/types";
import styles from "./TeamEditor.module.css";

export interface TeamEditorProps {
  teams: readonly AliasTeam[];
  onRename: (teamId: string, name: string) => void;
}

export function TeamEditor(props: TeamEditorProps) {
  const groupId = useId();
  return (
    <fieldset className={styles.root}>
      <legend className={styles.legend}>Названия команд</legend>
      <div className={styles.list}>
        {props.teams.map((team, index) => {
          const inputId = `${groupId}-${index}`;
          return (
            <label className={styles.field} htmlFor={inputId} key={team.id}>
              <span className={styles.label}>Команда {index + 1}</span>
              <input
                className={styles.input}
                id={inputId}
                type="text"
                autoComplete="off"
                maxLength={32}
                placeholder={`Команда ${index + 1}`}
                value={team.name}
                onChange={(event) => props.onRename(team.id, event.target.value)}
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
