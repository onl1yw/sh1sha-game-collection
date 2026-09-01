import { Check, X } from "lucide-react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { GameExitAction } from "../../../../shared/ui/GameExitAction";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import { Switch } from "../../../../shared/ui/Switch";
import { roundScore } from "../../domain/scoring";
import type { AliasSession, RoundWord } from "../../domain/types";
import styles from "./RoundReviewScreen.module.css";

export interface RoundReviewScreenProps {
  session: AliasSession;
  entries: readonly RoundWord[];
  onToggle: (entryId: string) => void;
  onConfirm: () => void;
  onExit: () => void;
  onOpenSettings: () => void;
}

export function RoundReviewScreen(props: RoundReviewScreenProps) {
  const team = props.session.setup.teams[props.session.activeTeamIndex];
  const delta = roundScore(props.entries, props.session.setup.penalizeSkips);
  return (
    <AppShell
      ariaLabel="Проверка раунда Alias"
      actions={(
        <Button fullWidth onClick={props.onConfirm}>Далее</Button>
      )}
    >
      <ScreenHeader
        eyebrow={team?.name ?? "Команда"}
        title="Проверьте слова"
        leadingAction={<GameExitAction onConfirm={props.onExit} />}
        trailingAction={<SettingsButton onClick={props.onOpenSettings} />}
      />
      <Card className={styles.summary} tone="accent">
        <span>Результат раунда</span>
        <strong>{formatSigned(delta)}</strong>
      </Card>
      <Card className={styles.words}>
        {props.entries.length > 0 ? props.entries.map((entry) => (
          <div className={styles.word} data-correct={entry.outcome === "correct"} key={entry.id}>
            <span className={styles.outcome} aria-hidden="true">
              {entry.outcome === "correct" ? <Check size={20} /> : <X size={20} />}
            </span>
            <strong>{entry.word.text}</strong>
            <Switch
              checked={entry.outcome === "correct"}
              label={`Засчитать слово «${entry.word.text}»`}
              onCheckedChange={() => props.onToggle(entry.id)}
            />
          </div>
        )) : (
          <p className={styles.empty}>За этот раунд слова не отмечены.</p>
        )}
      </Card>
      {props.session.setup.penalizeSkips ? (
        <p className={styles.note}>За каждое выключенное слово снимается одно очко.</p>
      ) : null}
    </AppShell>
  );
}

function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}
