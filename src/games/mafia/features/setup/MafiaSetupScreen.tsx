import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { NumberStepper } from "../../../../shared/ui/NumberStepper";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import { PlayerEditor, type EditablePlayer } from "./PlayerEditor";
import { RoleSettings, type RoleSettingsProps } from "./RoleSettings";
import { RulesSettings, type RulesSettingsProps } from "./RulesSettings";
import styles from "./MafiaSetupScreen.module.css";

export interface MafiaSetupScreenProps
  extends Omit<RoleSettingsProps, "loverAvailable" | "maniacAvailable">,
    RulesSettingsProps {
  players: readonly EditablePlayer[];
  minPlayers: number;
  maxPlayers: number;
  activePlayerCount: number;
  canStart: boolean;
  errorMessage?: string;
  onPlayerCountChange: (count: number) => void;
  onPlayerNameChange: (playerId: string, name: string) => void;
  onBack: () => void;
  onOpenSettings: () => void;
  onStart: () => void;
}

export function MafiaSetupScreen(props: MafiaSetupScreenProps) {
  return (
    <AppShell
      ariaLabel="Настройка Мафии"
      actions={(
        <Button fullWidth disabled={!props.canStart} onClick={props.onStart}>
          Раздать роли
        </Button>
      )}
    >
      <ScreenHeader
        title="Мафия"
        onBack={props.onBack}
        trailingAction={(
          <SettingsButton onClick={props.onOpenSettings} />
        )}
      />

      <Card>
        <NumberStepper
          label="Участников"
          value={props.players.length}
          min={props.minPlayers}
          max={props.maxPlayers}
          onChange={props.onPlayerCountChange}
        />
      </Card>

      <Card>
        <PlayerEditor players={props.players} onNameChange={props.onPlayerNameChange} />
      </Card>

      <Card>
        <RoleSettings
          ordinaryMafiaCount={props.ordinaryMafiaCount}
          maxOrdinaryMafia={props.maxOrdinaryMafia}
          civilianCount={props.civilianCount}
          don={props.don}
          commissioner={props.commissioner}
          doctor={props.doctor}
          lover={props.lover}
          loverMode={props.loverMode}
          loverAvailable={props.activePlayerCount >= 7}
          maniac={props.maniac}
          maniacAvailable={props.activePlayerCount >= 9}
          onOrdinaryMafiaCountChange={props.onOrdinaryMafiaCountChange}
          onDonChange={props.onDonChange}
          onCommissionerChange={props.onCommissionerChange}
          onDoctorChange={props.onDoctorChange}
          onLoverChange={props.onLoverChange}
          onLoverModeChange={props.onLoverModeChange}
          onManiacChange={props.onManiacChange}
        />
      </Card>

      <Card>
        <RulesSettings
          hostByLot={props.hostByLot}
          revealRoles={props.revealRoles}
          onHostByLotChange={props.onHostByLotChange}
          onRevealRolesChange={props.onRevealRolesChange}
        />
      </Card>

      {props.errorMessage ? (
        <p className={styles.error} role="alert">{props.errorMessage}</p>
      ) : null}
    </AppShell>
  );
}
