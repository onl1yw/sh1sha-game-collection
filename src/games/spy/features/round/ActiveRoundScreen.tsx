import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { ElapsedTimer } from "./ElapsedTimer";
import styles from "./ActiveRoundScreen.module.css";

export interface ActiveRoundScreenProps {
  firstPlayerName: string;
  startedAtMs?: number;
  themeName: string;
  onFinishRound: () => void;
}

export function ActiveRoundScreen({
  firstPlayerName,
  startedAtMs,
  themeName,
  onFinishRound,
}: ActiveRoundScreenProps) {
  return (
    <AppShell
      ariaLabel="Идёт игра"
      actions={
        <Button fullWidth onClick={onFinishRound}>
          Показать результаты
        </Button>
      }
    >
      <ScreenHeader
        eyebrow={themeName}
        title="Ищите шпиона"
      />

      <Card className={styles.prompt}>
        <ElapsedTimer {...(startedAtMs === undefined ? {} : { startedAtMs })} />
        <div className={styles.starter}>
          <p className={styles.label}>Начинает</p>
          <p className={styles.name}>{firstPlayerName}</p>
        </div>
      </Card>
    </AppShell>
  );
}
