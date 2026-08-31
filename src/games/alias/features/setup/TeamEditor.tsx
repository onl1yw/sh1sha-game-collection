import { Plus, Trash2 } from "lucide-react";
import { useId } from "react";

import { Button } from "../../../../shared/ui/Button";
import type { AliasTeam } from "../../domain/types";
import styles from "./TeamEditor.module.css";

export interface TeamEditorProps {
  teams: readonly AliasTeam[];
  canAdd: boolean;
  onAdd: () => void;
  onRemove: (teamId: string) => void;
  onRename: (teamId: string, name: string) => void;
}

export function TeamEditor(props: TeamEditorProps) {
  const groupId = useId();
  return (
    <fieldset className={styles.root}>
      <legend className={styles.legend}>Команды</legend>
      <p className={styles.hint}>
        Одной команды достаточно, если вы играете вдвоём или на собственный счёт.
      </p>
      <div className={styles.list}>
        {props.teams.map((team, index) => {
          const inputId = `${groupId}-${index}`;
          return (
            <div className={styles.team} key={team.id}>
              <label className={styles.field} htmlFor={inputId}>
                <span className={styles.label}>Команда {index + 1}</span>
                <input
                  className={styles.input}
                  id={inputId}
                  type="text"
                  autoComplete="off"
                  maxLength={32}
                  value={team.name}
                  onChange={(event) => props.onRename(team.id, event.target.value)}
                />
              </label>
              <Button
                className={styles.remove}
                variant="quiet"
                aria-label={`Удалить ${team.name || `команду ${index + 1}`}`}
                disabled={props.teams.length === 1}
                onClick={() => props.onRemove(team.id)}
              >
                <Trash2 aria-hidden="true" size={20} />
              </Button>
            </div>
          );
        })}
      </div>
      <Button fullWidth variant="secondary" disabled={!props.canAdd} onClick={props.onAdd}>
        <Plus aria-hidden="true" size={20} /> Добавить команду
      </Button>
    </fieldset>
  );
}
