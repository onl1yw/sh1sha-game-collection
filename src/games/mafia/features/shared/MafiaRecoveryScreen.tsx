import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";

export interface MafiaRecoveryScreenProps {
  message: string;
  onReset: () => void;
}

export function MafiaRecoveryScreen({ message, onReset }: MafiaRecoveryScreenProps) {
  return (
    <AppShell
      ariaLabel="Ошибка игры Мафия"
      actions={<Button fullWidth onClick={onReset}>Вернуться к настройке</Button>}
    >
      <ScreenHeader title="Не удалось продолжить" />
      <Card tone="danger"><p role="alert">{message}</p></Card>
    </AppShell>
  );
}
