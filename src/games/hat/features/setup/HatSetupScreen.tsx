import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { NumberStepper } from "../../../../shared/ui/NumberStepper";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import { TeamNamesFieldset } from "../../../../shared/ui/TeamNamesFieldset";
import { createHatTeam, HAT_LIMITS } from "../../domain/setup";
import type { HatTheme } from "../../domain/theme";
import type { HatSetup, HatTeam } from "../../domain/types";
import { formatHatWords } from "../stagePresentation";
import { HatRules } from "./HatRules";
import { HatThemeSelector } from "./HatThemeSelector";
import styles from "./HatSetupScreen.module.css";

export interface HatSetupScreenProps {
  setup: HatSetup;
  themes: readonly HatTheme[];
  availableWordCount: number;
  catalogWarnings: readonly string[];
  canStart: boolean;
  onBack: () => void;
  onOpenSettings: () => void;
  onTeamsChange: (teams: HatTeam[]) => void;
  onTeamRename: (teamId: string, name: string) => void;
  onThemeToggle: (themeId: string) => void;
  onWordCountChange: (count: number) => void;
  onDurationChange: (seconds: number) => void;
  onStart: () => void;
}

export function HatSetupScreen(props: HatSetupScreenProps) {
  const changeTeamCount = (count: number) => {
    const teams = props.setup.teams.slice(0, count);
    while (teams.length < count) teams.push(createHatTeam(teams.length));
    props.onTeamsChange(teams);
  };
  const validationMessage = setupError(
    props.setup,
    props.availableWordCount,
  );
  return (
    <AppShell
      ariaLabel="Настройка Шляпы"
      actions={(
        <Button fullWidth disabled={!props.canStart} onClick={props.onStart}>
          Начать игру
        </Button>
      )}
    >
      <ScreenHeader
        title="Шляпа"
        description="Одни и те же слова: объясните, покажите и подскажите одним словом"
        onBack={props.onBack}
        trailingAction={<SettingsButton onClick={props.onOpenSettings} />}
      />
      <Card>
        <NumberStepper
          label="Команд"
          value={props.setup.teams.length}
          min={HAT_LIMITS.minTeams}
          max={HAT_LIMITS.maxTeams}
          onChange={changeTeamCount}
        />
      </Card>
      <Card>
        <TeamNamesFieldset
          teams={props.setup.teams}
          onRename={props.onTeamRename}
        />
      </Card>
      <Card>
        <HatThemeSelector
          themes={props.themes}
          selectedIds={props.setup.selectedThemeIds}
          onToggle={props.onThemeToggle}
        />
      </Card>
      <Card>
        <HatRules
          wordCount={props.setup.wordCount}
          durationSeconds={props.setup.durationSeconds}
          availableWordCount={props.availableWordCount}
          onWordCountChange={props.onWordCountChange}
          onDurationChange={props.onDurationChange}
        />
      </Card>
      {validationMessage ? (
        <p className={styles.error} role="status">{validationMessage}</p>
      ) : null}
      {props.catalogWarnings.length > 0 ? (
        <p className={styles.warning} role="status">
          Некоторые темы пропущены, но остальные доступны.
        </p>
      ) : null}
    </AppShell>
  );
}

function setupError(setup: HatSetup, availableWordCount: number): string | null {
  if (setup.selectedThemeIds.length === 0) return "Выберите хотя бы одну тему";
  if (setup.teams.some((team) => !team.name.trim())) return "Назовите все команды";
  const names = setup.teams.map((team) => team.name.trim().toLocaleLowerCase("ru"));
  if (new Set(names).size !== names.length) {
    return "Названия команд не должны повторяться";
  }
  if (setup.wordCount > availableWordCount) {
    return `В выбранных темах доступно: ${formatHatWords(availableWordCount)}`;
  }
  return null;
}
