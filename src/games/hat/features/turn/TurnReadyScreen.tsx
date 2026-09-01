import { Hand, MessageCircleMore, WholeWord } from "lucide-react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { GameExitAction } from "../../../../shared/ui/GameExitAction";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import type { HatSession } from "../../domain/types";
import {
  formatHatWords,
  hatStageAt,
  hatStageEyebrow,
  hatStagePresentation,
} from "../stagePresentation";
import styles from "./TurnReadyScreen.module.css";

export interface TurnReadyScreenProps {
  session: HatSession;
  onExit: () => void;
  onOpenSettings: () => void;
  onReady: () => void;
}

export function TurnReadyScreen(props: TurnReadyScreenProps) {
  const team = props.session.setup.teams[props.session.activeTeamIndex];
  const presentation = hatStagePresentation(props.session.stageIndex);
  return (
    <AppShell
      ariaLabel="Подготовка к ходу в Шляпе"
      actions={<Button fullWidth onClick={props.onReady}>Готово</Button>}
    >
      <ScreenHeader
        eyebrow={hatStageEyebrow(props.session.stageIndex)}
        title={team?.name ?? "Команда"}
        description={`Передайте телефон ведущему · В шляпе ${formatHatWords(props.session.remainingWordIds.length)}`}
        leadingAction={<GameExitAction onConfirm={props.onExit} />}
        trailingAction={<SettingsButton onClick={props.onOpenSettings} />}
      />
      <Card className={styles.instruction} tone="accent">
        <StageIcon stageIndex={props.session.stageIndex} />
        <h2>{presentation.title}</h2>
      </Card>
      <Scoreboard session={props.session} />
    </AppShell>
  );
}

function Scoreboard({ session }: { session: HatSession }) {
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

function StageIcon({ stageIndex }: { stageIndex: number }) {
  const stage = hatStageAt(stageIndex);
  const props = { "aria-hidden": true, size: 56, strokeWidth: 1.6 } as const;
  if (stage === "gestures") return <Hand {...props} />;
  if (stage === "one-word") return <WholeWord {...props} />;
  return <MessageCircleMore {...props} />;
}
