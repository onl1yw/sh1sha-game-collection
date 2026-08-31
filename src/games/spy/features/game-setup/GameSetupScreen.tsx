import { MAX_PLAYERS, MIN_PLAYERS } from "../../domain/game/playerLimits";
import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { ConfirmAction } from "../../../../shared/ui/ConfirmAction";
import { NumberStepper } from "../../../../shared/ui/NumberStepper";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import {
  PlayerListEditor,
  type EditablePlayer,
} from "./PlayerListEditor";
import {
  SpyModeSelector,
  type SpyModeValue,
} from "./SpyModeSelector";
import styles from "./GameSetupScreen.module.css";

export interface GameSetupScreenProps {
  themeName: string;
  players: readonly EditablePlayer[];
  spyCount: number;
  spyMode: SpyModeValue;
  minPlayers?: number;
  maxPlayers?: number;
  canStart?: boolean;
  errorMessage?: string;
  onPlayerCountChange: (count: number) => void;
  onPlayerNameChange: (playerId: string, name: string) => void;
  onSpyCountChange: (count: number) => void;
  onSpyModeChange: (mode: SpyModeValue) => void;
  onBack: () => void;
  onOpenSettings: () => void;
  onStart: () => void;
  onResetHistory?: () => void;
}

export function GameSetupScreen({
  themeName,
  players,
  spyCount,
  spyMode,
  minPlayers = MIN_PLAYERS,
  maxPlayers = MAX_PLAYERS,
  canStart = true,
  errorMessage,
  onPlayerCountChange,
  onPlayerNameChange,
  onSpyCountChange,
  onSpyModeChange,
  onBack,
  onOpenSettings,
  onStart,
  onResetHistory,
}: GameSetupScreenProps) {
  const maxSpyCount = Math.max(1, players.length - 1);

  return (
    <AppShell
      ariaLabel="Настройка игры"
      actions={
        <Button fullWidth disabled={!canStart} onClick={onStart}>
          Раздать роли
        </Button>
      }
    >
      <ScreenHeader
        title={themeName}
        onBack={onBack}
        trailingAction={<SettingsButton onClick={onOpenSettings} />}
      />

      <Card className={styles.section}>
        <NumberStepper
          label="Игроков"
          value={players.length}
          min={minPlayers}
          max={maxPlayers}
          onChange={onPlayerCountChange}
        />
        <NumberStepper
          label="Шпионов"
          hint={`Максимум ${maxSpyCount}`}
          value={spyCount}
          min={1}
          max={maxSpyCount}
          onChange={onSpyCountChange}
        />
      </Card>

      <Card>
        <PlayerListEditor
          players={players}
          onNameChange={onPlayerNameChange}
        />
      </Card>

      <Card>
        <SpyModeSelector value={spyMode} onChange={onSpyModeChange} />
      </Card>

      {errorMessage ? (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}

      {onResetHistory ? (
        <ConfirmAction
          triggerLabel="Сбросить историю жеребьёвки"
          prompt="Сбросить историю? Следующие роли будут распределяться без учёта прошлых раундов."
          confirmLabel="Да, сбросить историю"
          cancelLabel="Не сбрасывать"
          successMessage="История жеребьёвки сброшена."
          onConfirm={onResetHistory}
        />
      ) : null}
    </AppShell>
  );
}
