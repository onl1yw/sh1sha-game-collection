import { useId } from "react";

import styles from "./PlayerEditor.module.css";

export interface EditablePlayer {
  id: string;
  name: string;
}

export interface PlayerEditorProps {
  players: readonly EditablePlayer[];
  onNameChange: (playerId: string, name: string) => void;
}

export function PlayerEditor({ players, onNameChange }: PlayerEditorProps) {
  const groupId = useId();
  return (
    <fieldset className={styles.root}>
      <legend className={styles.legend}>Имена игроков</legend>
      <div className={styles.list}>
        {players.map((player, index) => {
          const inputId = `${groupId}-${index}`;
          const fallbackName = `Игрок ${index + 1}`;
          return (
            <label className={styles.field} htmlFor={inputId} key={player.id}>
              <span className={styles.label}>{fallbackName}</span>
              <input
                className={styles.input}
                id={inputId}
                type="text"
                autoComplete="off"
                maxLength={32}
                placeholder={fallbackName}
                value={player.name}
                onChange={(event) => onNameChange(player.id, event.target.value)}
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
