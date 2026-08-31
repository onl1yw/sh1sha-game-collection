import { CircleSlash2 } from "lucide-react";

import { Button } from "../../../../shared/ui/Button";
import styles from "./TargetGrid.module.css";

export interface TargetOption {
  id: string;
  name: string;
  voteBlocked?: boolean;
}

export interface TargetGridProps {
  targets: readonly TargetOption[];
  selectedId: string | null;
  onSelect: (playerId: string) => void;
}

export function TargetGrid({ targets, selectedId, onSelect }: TargetGridProps) {
  return (
    <div className={styles.grid} role="group" aria-label="Выберите игрока">
      {targets.map((target) => (
        <Button
          key={target.id}
          className={styles.target}
          variant="secondary"
          aria-pressed={selectedId === target.id}
          onClick={() => onSelect(target.id)}
        >
          <span>{target.name}</span>
          {target.voteBlocked ? (
            <span className={styles.status} aria-label="Без права голоса">
              <CircleSlash2 aria-hidden="true" focusable="false" size={18} strokeWidth={2} />
            </span>
          ) : null}
        </Button>
      ))}
    </div>
  );
}
