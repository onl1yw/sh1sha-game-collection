import type { Dispatch } from "react";

import { AppShell } from "../../../shared/ui/AppShell";
import { Card } from "../../../shared/ui/Card";
import { ScreenHeader } from "../../../shared/ui/ScreenHeader";
import { createWordDeck } from "../domain/deck";
import { setupIsValid } from "../domain/setup";
import type { AliasTheme } from "../domain/theme";
import type { AliasGameState } from "../domain/types";
import { ActiveRoundScreen } from "../features/round/ActiveRoundScreen";
import { RoundReadyScreen } from "../features/round/RoundReadyScreen";
import { RoundReviewScreen } from "../features/review/RoundReviewScreen";
import { AliasResultsScreen } from "../features/results/AliasResultsScreen";
import { AliasSetupScreen } from "../features/setup/AliasSetupScreen";
import type { AliasGameAction } from "./state/gameActions";

export interface AliasScreenRouterProps {
  state: AliasGameState;
  dispatch: Dispatch<AliasGameAction>;
  themes: readonly AliasTheme[];
  catalogStatus: "loading" | "ready";
  catalogWarnings: readonly string[];
  onExit: () => void;
  onOpenSettings: () => void;
}

export function AliasScreenRouter(props: AliasScreenRouterProps) {
  if (props.catalogStatus === "loading") {
    return (
      <AppShell ariaLabel="Загрузка Alias">
        <ScreenHeader title="Alias" />
        <Card><p>Загружаем темы…</p></Card>
      </AppShell>
    );
  }
  if (props.themes.length === 0) {
    return (
      <AppShell ariaLabel="Ошибка Alias">
        <ScreenHeader title="Alias" onBack={props.onExit} />
        <Card><p role="alert">Не удалось загрузить ни одной темы.</p></Card>
      </AppShell>
    );
  }
  if (props.state.phase === "setup") {
    const { setup } = props.state;
    return (
      <AliasSetupScreen
        setup={setup}
        themes={props.themes}
        catalogWarnings={props.catalogWarnings}
        canStart={setupIsValid(setup) && props.themes.some(
          (theme) => setup.selectedThemeIds.includes(theme.id),
        )}
        onBack={props.onExit}
        onOpenSettings={props.onOpenSettings}
        onTeamsChange={(teams) => props.dispatch({ type: "replace-teams", teams })}
        onTeamRename={(teamId, name) => props.dispatch({ type: "rename-team", teamId, name })}
        onThemeToggle={(themeId) => props.dispatch({ type: "toggle-theme", themeId })}
        onDurationChange={(seconds) => props.dispatch({ type: "set-duration", seconds })}
        onPenaltyChange={(enabled) => props.dispatch({ type: "set-skip-penalty", enabled })}
        onWinConditionChange={(winCondition) => props.dispatch({
          type: "set-win-condition",
          winCondition,
        })}
        onStart={() => props.dispatch({
          type: "start-game",
          deck: createWordDeck(props.themes, setup.selectedThemeIds),
        })}
      />
    );
  }
  if (props.state.phase === "ready") {
    return (
      <RoundReadyScreen
        session={props.state.session}
        onExit={props.onExit}
        onOpenSettings={props.onOpenSettings}
        onReady={() => props.dispatch({ type: "start-round" })}
      />
    );
  }
  if (props.state.phase === "round") {
    return (
      <ActiveRoundScreen
        session={props.state.session}
        onExit={props.onExit}
        onMark={(outcome) => props.dispatch({ type: "record-word", outcome })}
        onExpire={() => props.dispatch({ type: "finish-round" })}
      />
    );
  }
  if (props.state.phase === "review") {
    return (
      <RoundReviewScreen
        session={props.state.session}
        entries={props.state.entries}
        onToggle={(entryId) => props.dispatch({ type: "toggle-result", entryId })}
        onConfirm={() => props.dispatch({ type: "confirm-review" })}
        onExit={props.onExit}
        onOpenSettings={props.onOpenSettings}
      />
    );
  }
  return (
    <AliasResultsScreen
      session={props.state.session}
      onPlayAgain={() => props.dispatch({ type: "play-again" })}
      onExit={props.onExit}
      onOpenSettings={props.onOpenSettings}
    />
  );
}
