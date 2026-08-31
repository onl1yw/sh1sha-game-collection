import { MessagesSquare } from "lucide-react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { GameExitAction } from "../../../../shared/ui/GameExitAction";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import styles from "./DiscussionScreen.module.css";

export interface DiscussionScreenProps {
  dayNumber: number;
  aliveCount: number;
  onOpenSettings: () => void;
  onVote: () => void;
  onCancel: () => void;
}

export function DiscussionScreen(props: DiscussionScreenProps) {
  return (
    <AppShell
      ariaLabel={`День ${props.dayNumber}: обсуждение`}
      actions={<Button fullWidth onClick={props.onVote}>Перейти к голосованию</Button>}
    >
      <ScreenHeader
        eyebrow={`День ${props.dayNumber}`}
        title="Обсуждение"
        leadingAction={(
          <GameExitAction onConfirm={props.onCancel} />
        )}
        trailingAction={(
          <SettingsButton onClick={props.onOpenSettings} />
        )}
      />
      <Card className={styles.card}>
        <MessagesSquare aria-hidden="true" focusable="false" size={42} strokeWidth={1.7} />
        <p>Обсудите события и решите, кого подозреваете.</p>
        <span>В игре осталось: {props.aliveCount}</span>
      </Card>
    </AppShell>
  );
}
