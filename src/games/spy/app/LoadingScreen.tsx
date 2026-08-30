import { AppShell } from "../../../shared/ui/AppShell";
import { Card } from "../../../shared/ui/Card";
import { ScreenHeader } from "../../../shared/ui/ScreenHeader";

export function LoadingScreen() {
  return (
    <AppShell ariaLabel="Восстановление игры">
      <ScreenHeader
        eyebrow="Шпион"
        title="Восстанавливаем игру"
        description="Загружаем выбранную тематику и настройки."
      />
      <Card role="status" aria-live="polite">
        Одну секунду…
      </Card>
    </AppShell>
  );
}
