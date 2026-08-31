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
  const roundForTeam = (props.session.roundsPlayed[team?.id ?? ""] ?? 0) + 1;
  return (
    <AppShell
      ariaLabel="Подготовка к раунду Alias"
      actions={<Button fullWidth onClick={props.onReady}>Готово</Button>}
    >
      <ScreenHeader
        eyebrow={`Раунд ${props.session.roundNumber}`}
        title={team?.name ?? "Команда"}
        description={`Раунд команды: ${roundForTeam}`}
        leadingAction={<GameExitAction onConfirm={props.onExit} />}
        trailingAction={<SettingsButton onClick={props.onOpenSettings} />}
      />
      <Card className={styles.card} tone="accent">
        <MessageCircleMore aria-hidden="true" size={56} strokeWidth={1.6} />
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Передайте телефон ведущему</p>
          <h2>Объясняйте слова своей команде</h2>
          <p>Галочка засчитает слово. Если не получается — смахните карточку или нажмите «Пропустить».</p>
        </div>
      </Card>
      <ScoreStrip session={props.session} />
    </AppShell>
  );
}

function ScoreStrip({ session }: { session: AliasSession }) {
  return (
    <div className={styles.scores} aria-label="Текущий счёт">
      {session.setup.teams.map((team) => (
        <span className={styles.score} key={team.id}>
          <span>{team.name}</span>
          <strong>{session.scores[team.id] ?? 0}</strong>
        </span>
      ))}
    </div>
  );
}
