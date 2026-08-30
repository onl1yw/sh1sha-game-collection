import { Component, type ReactNode } from "react";

import { AppShell } from "../shared/ui/AppShell";
import { Button } from "../shared/ui/Button";
import { Card } from "../shared/ui/Card";
import { ScreenHeader } from "../shared/ui/ScreenHeader";

interface GameErrorBoundaryProps {
  children: ReactNode;
  gameTitle: string;
  onExit: () => void;
}

interface GameErrorBoundaryState {
  failed: boolean;
}

export class GameErrorBoundary extends Component<
  GameErrorBoundaryProps,
  GameErrorBoundaryState
> {
  public state: GameErrorBoundaryState = { failed: false };

  public static getDerivedStateFromError(): GameErrorBoundaryState {
    return { failed: true };
  }

  public componentDidCatch(): void {
    // The shell stays usable. A future telemetry adapter can report this safely.
  }

  public render() {
    if (!this.state.failed) return this.props.children;

    return (
      <AppShell
        ariaLabel="Ошибка игры"
        actions={(
          <>
            <Button fullWidth onClick={() => globalThis.location.reload()}>
              Перезагрузить
            </Button>
            <Button fullWidth variant="secondary" onClick={this.props.onExit}>
              Все игры
            </Button>
          </>
        )}
      >
        <ScreenHeader title="Игра не загрузилась" />
        <Card role="alert">
          Модуль «{this.props.gameTitle}» завершился с ошибкой. Остальная
          коллекция не пострадала.
        </Card>
      </AppShell>
    );
  }
}
