import { RefreshCcw } from "lucide-react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { GameExitAction } from "../../../../shared/ui/GameExitAction";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import type { HatSession } from "../../domain/types";
import { formatHatWords, hatStagePresentation } from "../stagePresentation";
import { formatDuration } from "../turn/useTurnTimer";
import styles from "./StageCompleteScreen.module.css";

export interface StageCompleteScreenProps {
  session: HatSession;
  remainingMs: number;
  onContinueNow: () => void;
  onCarryTime: () => void;
  onExit: () => void;
  onOpenSettings: () => void;
}

export function StageCompleteScreen(props: StageCompleteScreenProps) {
  const team = props.session.setup.teams[props.session.activeTeamIndex];
  const isSolo = props.session.setup.teams.length === 1;
  const remaining = formatDuration(props.remainingMs);
  const nextStage = hatStagePresentation(props.session.stageIndex + 1);
  return (
    <AppShell
      ariaLabel="Переход между этапами Шляпы"
      actions={(
        <>
          <Button fullWidth onClick={props.onContinueNow}>
            Играть дальше — осталось {remaining}
          </Button>
          <Button fullWidth variant="secondary" onClick={props.onCarryTime}>
            Сохранить {remaining} для следующего хода
          </Button>
        </>
      )}
    >
      <ScreenHeader
        eyebrow={`Этап ${props.session.stageIndex + 1} завершён`}
        title="Стопка закончилась"
        description={`У команды «${team?.name ?? "Команда"}» осталось ${remaining}`}
        leadingAction={<GameExitAction onConfirm={props.onExit} />}
        trailingAction={<SettingsButton onClick={props.onOpenSettings} />}
      />
      <Card className={styles.next} tone="accent">
        <RefreshCcw aria-hidden="true" size={48} strokeWidth={1.7} />
        <span>Следующий этап</span>
        <h2>{nextStage.title}</h2>
        <p>
          Снова используем тот же набор — {formatHatWords(props.session.masterWords.length)}.
        </p>
      </Card>
      <Card className={styles.options}>
        <div>
          <strong>Играть сейчас</strong>
          <span>{team?.name ?? "Команда"} начнёт новый этап с оставшимся временем.</span>
        </div>
        <div>
          <strong>Сохранить время</strong>
          <span>{isSolo
            ? "Остаток добавится к полному следующему ходу."
            : "Следующей играет другая команда, а остаток станет бонусом."}</span>
        </div>
      </Card>
    </AppShell>
  );
}
