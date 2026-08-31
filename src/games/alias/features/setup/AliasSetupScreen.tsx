import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import { ALIAS_LIMITS, createTeam } from "../../domain/setup";
import type { AliasTheme } from "../../domain/theme";
import type { AliasSetup, AliasTeam, WinCondition } from "../../domain/types";
import { RoundSettings } from "./RoundSettings";
import { TeamEditor } from "./TeamEditor";
import { ThemeSelector } from "./ThemeSelector";
import styles from "./AliasSetupScreen.module.css";

export interface AliasSetupScreenProps {
  setup: AliasSetup;
  themes: readonly AliasTheme[];
  catalogWarnings: readonly string[];
  canStart: boolean;
  onBack: () => void;
  onOpenSettings: () => void;
  onTeamsChange: (teams: AliasTeam[]) => void;
  onTeamRename: (teamId: string, name: string) => void;
  onThemeToggle: (themeId: string) => void;
  onDurationChange: (seconds: number) => void;
  onPenaltyChange: (enabled: boolean) => void;
  onWinConditionChange: (condition: WinCondition) => void;
  onStart: () => void;
}

export function AliasSetupScreen(props: AliasSetupScreenProps) {
  const addTeam = () => {
    const nextIndex = Math.max(0, ...props.setup.teams.map((team) => {
      const number = Number(team.id.replace("team-", ""));
      return Number.isFinite(number) ? number : 0;
    }));
    props.onTeamsChange([...props.setup.teams, createTeam(nextIndex)]);
  };
  const removeTeam = (teamId: string) => {
    props.onTeamsChange(props.setup.teams.filter((team) => team.id !== teamId));
  };
  const validationMessage = setupError(props.setup, props.themes);

  return (
    <AppShell
      ariaLabel="Настройка Alias"
      actions={(
        <Button fullWidth disabled={!props.canStart} onClick={props.onStart}>
          Начать игру
        </Button>
      )}
    >
      <ScreenHeader
        title="Alias"
        description="Объясняйте слова, не называя их напрямую"
        onBack={props.onBack}
        trailingAction={<SettingsButton onClick={props.onOpenSettings} />}
      />
      <Card>
        <TeamEditor
          teams={props.setup.teams}
          canAdd={props.setup.teams.length < ALIAS_LIMITS.maxTeams}
          onAdd={addTeam}
          onRemove={removeTeam}
          onRename={props.onTeamRename}
        />
      </Card>
      <Card>
        <ThemeSelector
          themes={props.themes}
          selectedIds={props.setup.selectedThemeIds}
          onToggle={props.onThemeToggle}
        />
      </Card>
      <Card>
        <RoundSettings
          durationSeconds={props.setup.durationSeconds}
          penalizeSkips={props.setup.penalizeSkips}
          winCondition={props.setup.winCondition}
          onDurationChange={props.onDurationChange}
          onPenaltyChange={props.onPenaltyChange}
          onWinConditionChange={props.onWinConditionChange}
        />
      </Card>
      {validationMessage ? <p className={styles.error} role="status">{validationMessage}</p> : null}
      {props.catalogWarnings.length > 0 ? (
        <p className={styles.warning} role="status">
          Некоторые темы пропущены, но остальные доступны.
        </p>
      ) : null}
    </AppShell>
  );
}

function setupError(setup: AliasSetup, themes: readonly AliasTheme[]): string | null {
  if (!themes.some((theme) => setup.selectedThemeIds.includes(theme.id))) {
    return "Выберите хотя бы одну тему";
  }
  if (setup.teams.some((team) => !team.name.trim())) return "Назовите все команды";
  const names = setup.teams.map((team) => team.name.trim().toLocaleLowerCase("ru"));
  if (new Set(names).size !== names.length) return "Названия команд не должны повторяться";
  return null;
}
