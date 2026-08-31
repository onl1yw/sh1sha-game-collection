import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { GameExitAction } from "../../../../shared/ui/GameExitAction";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import styles from "./RoundReadyScreen.module.css";

export interface RoundReadyScreenProps {
  firstPlayerName: string;
  themeName: string;
  onCancel: () => void;
  onOpenSettings: () => void;
  onStart: () => void;
}

export function RoundReadyScreen({
  firstPlayerName,
  themeName,
  onCancel,
  onOpenSettings,
  onStart,
}: RoundReadyScreenProps) {
  return (
    <AppShell
      ariaLabel="Все роли розданы"
      actions={
        <Button fullWidth onClick={onStart}>
          Начать игру
        </Button>
      }
    >
      <ScreenHeader
        eyebrow={themeName}
        title="Роли розданы"
        description="Теперь экран можно показать всем игрокам."
        leadingAction={<GameExitAction onConfirm={onCancel} />}
        trailingAction={<SettingsButton onClick={onOpenSettings} />}
      />

      <Card className={styles.starter} tone="accent">
        <p className={styles.label}>Первый вопрос задаёт</p>
        <p className={styles.name}>{firstPlayerName}</p>
      </Card>

      <p className={styles.rule}>
        Задавайте вопросы по кругу. Отвечайте коротко и не называйте объект напрямую.
      </p>
    </AppShell>
  );
}
