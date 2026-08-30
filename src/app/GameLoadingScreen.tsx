import { AppShell } from "../shared/ui/AppShell";
import { Card } from "../shared/ui/Card";
import { ScreenHeader } from "../shared/ui/ScreenHeader";

export function GameLoadingScreen() {
  return (
    <AppShell ariaLabel="Загрузка игры">
      <ScreenHeader title="Загружаем игру" />
      <Card role="status" aria-live="polite">Один момент…</Card>
    </AppShell>
  );
}
