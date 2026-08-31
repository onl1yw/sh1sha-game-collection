import { MoonStar } from "lucide-react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { GameExitAction } from "../../../../shared/ui/GameExitAction";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import styles from "./NightCoverScreen.module.css";

export interface NightCoverScreenProps {
  nightNumber: number;
  hostByLot: boolean;
  narrationAvailable: boolean;
  soundEnabled: boolean;
  onCancel: () => void;
  onOpenSettings: () => void;
  onStart: () => void;
}

export function NightCoverScreen(props: NightCoverScreenProps) {
  const canStart = props.hostByLot || (props.soundEnabled && props.narrationAvailable);
  const guidance = props.hostByLot
    ? "Ведущий вызывает роли и передаёт им телефон."
    : narrationGuidance(props.soundEnabled, props.narrationAvailable);
  return (
    <AppShell
      ariaLabel={`Ночь ${props.nightNumber}`}
      actions={(
        <Button fullWidth disabled={!canStart} onClick={props.onStart}>
          Начать ночь
        </Button>
      )}
    >
      <ScreenHeader
        eyebrow={`Ночь ${props.nightNumber}`}
        title="Город засыпает"
        leadingAction={<GameExitAction onConfirm={props.onCancel} />}
        trailingAction={(
          <SettingsButton onClick={props.onOpenSettings} />
        )}
      />
      <Card className={styles.card} tone={canStart ? "default" : "danger"}>
        <MoonStar aria-hidden="true" focusable="false" size={44} strokeWidth={1.7} />
        <p>{props.hostByLot
          ? "Все, кроме ведущего, закрывают глаза."
          : "Положите телефон в центр и закройте глаза."}</p>
        <span role={canStart ? undefined : "alert"}>{guidance}</span>
      </Card>
    </AppShell>
  );
}

function narrationGuidance(soundEnabled: boolean, narrationAvailable: boolean): string {
  if (!narrationAvailable) {
    return "Озвучка недоступна в этом браузере. Откройте игру в другом браузере.";
  }
  if (!soundEnabled) return "Включите звук, чтобы ведущий мог вызывать роли.";
  return "Ведущий сам вызовет нужные роли.";
}
