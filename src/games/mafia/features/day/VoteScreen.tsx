import { Vote } from "lucide-react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import { TargetGrid, type TargetOption } from "../night/TargetGrid";
import styles from "./VoteScreen.module.css";

export const NO_ELIMINATION = "no-elimination" as const;

export interface VoteScreenProps {
  dayNumber: number;
  players: readonly TargetOption[];
  voteBlockedPlayerId: string | null;
  selectedId: string | null;
  onSelect: (playerId: string) => void;
  onOpenSettings: () => void;
  onBack: () => void;
  onConfirm: () => void;
}

export function VoteScreen(props: VoteScreenProps) {
  return (
    <AppShell
      ariaLabel={`День ${props.dayNumber}: голосование`}
      actions={(
        <Button fullWidth disabled={props.selectedId === null} onClick={props.onConfirm}>
          Подтвердить результат
        </Button>
      )}
    >
      <ScreenHeader
        eyebrow={`День ${props.dayNumber}`}
        title="Голосование"
        onBack={props.onBack}
        trailingAction={(
          <SettingsButton onClick={props.onOpenSettings} />
        )}
      />
      <Card className={styles.prompt}>
        <Vote aria-hidden="true" focusable="false" size={32} strokeWidth={1.7} />
        <p>Кого город исключает из игры?</p>
      </Card>
      <TargetGrid
        targets={props.players.map((player) => ({
          ...player,
          voteBlocked: player.id === props.voteBlockedPlayerId,
        }))}
        selectedId={props.selectedId}
        onSelect={props.onSelect}
      />
      <Button
        fullWidth
        variant="secondary"
        aria-pressed={props.selectedId === NO_ELIMINATION}
        onClick={() => props.onSelect(NO_ELIMINATION)}
      >
        Никого
      </Button>
    </AppShell>
  );
}
