import { AppShell } from "../../../shared/ui/AppShell";
import { Button } from "../../../shared/ui/Button";
import { ScreenHeader } from "../../../shared/ui/ScreenHeader";
import styles from "./RecoveryScreen.module.css";

interface RecoveryScreenProps {
  message: string;
  onReset: () => void;
}

export function RecoveryScreen({ message, onReset }: RecoveryScreenProps) {
  return (
    <AppShell
      ariaLabel="Восстановление игры"
      actions={
        <Button fullWidth onClick={onReset}>
          Вернуться в начало
        </Button>
      }
    >
      <ScreenHeader
        eyebrow="Нужна новая раздача"
        title="Игра не восстановилась"
      />
      <p className={styles.message} role="alert">
        {message}
      </p>
    </AppShell>
  );
}
