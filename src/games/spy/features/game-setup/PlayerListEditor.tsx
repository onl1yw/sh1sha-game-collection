import { useId } from "react";

import styles from "./PlayerListEditor.module.css";

export interface EditablePlayer {
  id: string;
  name: string;
}

export interface PlayerListEditorProps {
  players: readonly EditablePlayer[];
  disabled?: boolean;
  onNameChange: (playerId: string, name: string) => void;
}

export function PlayerListEditor({
  players,
  disabled = false,
  onNameChange,
}: PlayerListEditorProps) {
  const fieldId = useId();

  return (
    <fieldset className={styles.root} disabled={disabled}>
      <legend className={styles.legend}>Имена игроков</legend>
      <div className={styles.list}>
        {players.map((player, index) => {
          const inputId = `${fieldId}-${index}`;
          const fallbackName = `Игрок ${index + 1}`;

          return (
            <div className={styles.field} key={`player-slot-${index}`}>
              <label className={styles.label} htmlFor={inputId}>
                {fallbackName}
              </label>
              <input
                className={styles.input}
                id={inputId}
                name={`player-name-${index + 1}`}
                type="text"
                autoComplete="off"
                maxLength={32}
                placeholder={fallbackName}
                value={player.name}
                onChange={(event) => onNameChange(player.id, event.target.value)}
              />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
