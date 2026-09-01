import { MessageCircleMore } from "lucide-react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { GameExitAction } from "../../../../shared/ui/GameExitAction";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import type { AliasSession } from "../../domain/types";
import styles from "./RoundReadyScreen.module.css";

export interface RoundReadyScreenProps {
  session: AliasSession;
  onExit: () => void;
  onOpenSettings: () => void;
  onReady: () => void;
}

export function RoundReadyScreen(props: RoundReadyScreenProps) {
  const team = props.session.setup.teams[props.session.activeTeamIndex];
  return (
    <AppShell
      ariaLabel="Подготовка к раунду Alias"
      actions={<Button fullWidth onClick={props.onReady}>Готово</Button>}
    >
      <ScreenHeader
        eyebrow={`Раунд ${props.session.roundNumber}`}
        title={team?.name ?? "Команда"}
        leadingAction={<GameExitAction onConfirm={props.onExit} />}
        trailingAction={<SettingsButton onClick={props.onOpenSettings} />}
      />
      <Card className={styles.card} tone="accent">
        <MessageCircleMore aria-hidden="true" size={56} strokeWidth={1.6} />
        <h2>Передайте телефон ведущему</h2>
      </Card>
      <Scoreboard session={props.session} />
    </AppShell>
  );
}

function Scoreboard({ session }: { session: AliasSession }) {
  return (
    <Card className={styles.scoreboard}>
      <h2>Счёт</h2>
      <div className={styles.scores}>
        {session.setup.teams.map((team, index) => (
          <div
            className={styles.score}
            data-active={index === session.activeTeamIndex}
            key={team.id}
          >
            <span>{team.name}</span>
            <strong>{session.scores[team.id] ?? 0}</strong>
          </div>
        ))}
      </div>
    </Card>
  );
}
