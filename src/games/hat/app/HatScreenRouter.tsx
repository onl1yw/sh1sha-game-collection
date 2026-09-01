import type { Dispatch } from "react";

import { AppShell } from "../../../shared/ui/AppShell";
import { Card } from "../../../shared/ui/Card";
import { ScreenHeader } from "../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../shared/ui/SettingsButton";
import {
  availableHatWordCount,
  createHatWordPool,
  requeueSkippedWord,
  reviewedWordQueue,
  shuffleWordIds,
} from "../domain/pool";
import { hatSetupIsValid } from "../domain/setup";
import type { HatTheme } from "../domain/theme";
import type { HatGameState, HatSession } from "../domain/types";
import { HatResultsScreen } from "../features/results/HatResultsScreen";
import { TurnReviewScreen } from "../features/review/TurnReviewScreen";
import { HatSetupScreen } from "../features/setup/HatSetupScreen";
import { StageCompleteScreen } from "../features/stage/StageCompleteScreen";
import { ActiveTurnScreen } from "../features/turn/ActiveTurnScreen";
import { TurnReadyScreen } from "../features/turn/TurnReadyScreen";
import type { HatGameAction } from "./state/gameActions";

export interface HatScreenRouterProps {
  state: HatGameState;
  dispatch: Dispatch<HatGameAction>;
  themes: readonly HatTheme[];
  catalogStatus: "loading" | "ready";
  catalogWarnings: readonly string[];
  paused: boolean;
  onExit: () => void;
  onOpenSettings: () => void;
}

export function HatScreenRouter(props: HatScreenRouterProps) {
  if (props.catalogStatus === "loading") {
    return (
      <HatCatalogLoading
        onExit={props.onExit}
        onOpenSettings={props.onOpenSettings}
      />
    );
  }
  if (props.themes.length === 0) {
    return (
      <HatCatalogError
        onExit={props.onExit}
        onOpenSettings={props.onOpenSettings}
      />
    );
  }
  if (props.state.phase === "setup") return setupScreen(props);
  if (props.state.phase === "ready") {
    return (
      <TurnReadyScreen
        session={props.state.session}
        onExit={props.onExit}
        onOpenSettings={props.onOpenSettings}
        onReady={() => props.dispatch({ type: "start-turn" })}
      />
    );
  }
  if (props.state.phase === "turn") {
    const { draft, session } = props.state;
    return (
      <ActiveTurnScreen
        session={session}
        draft={draft}
        paused={props.paused}
        onExit={props.onExit}
        onOpenSettings={props.onOpenSettings}
        onCorrect={(remainingMs) => props.dispatch({
          type: "mark-correct",
          remainingMs,
        })}
        onSkip={() => props.dispatch({
          type: "skip-word",
          queueWordIds: requeueSkippedWord(draft.queueWordIds),
        })}
        onExpire={() => props.dispatch({ type: "expire-turn" })}
      />
    );
  }
  if (props.state.phase === "review") return reviewScreen(props);
  if (props.state.phase === "stage-choice") {
    const { session } = props.state;
    return (
      <StageCompleteScreen
        session={session}
        remainingMs={props.state.remainingMs}
        onContinueNow={() => props.dispatch({
          type: "continue-next-stage",
          nextStageWordIds: freshStageQueue(session),
        })}
        onCarryTime={() => props.dispatch({
          type: "carry-stage-time",
          nextStageWordIds: freshStageQueue(session),
        })}
        onExit={props.onExit}
        onOpenSettings={props.onOpenSettings}
      />
    );
  }
  return (
    <HatResultsScreen
      session={props.state.session}
      onPlayAgain={() => props.dispatch({ type: "play-again" })}
      onExit={props.onExit}
      onOpenSettings={props.onOpenSettings}
    />
  );
}

function setupScreen(props: HatScreenRouterProps) {
  if (props.state.phase !== "setup") return null;
  const { setup } = props.state;
  const availableWordCount = availableHatWordCount(
    props.themes,
    setup.selectedThemeIds,
  );
  const canStart = hatSetupIsValid(setup, availableWordCount);
  const start = () => {
    if (!canStart) return;
    props.dispatch({
      type: "start-game",
      masterWords: createHatWordPool(
        props.themes,
        setup.selectedThemeIds,
        setup.wordCount,
      ),
    });
  };
  return (
    <HatSetupScreen
      setup={setup}
      themes={props.themes}
      availableWordCount={availableWordCount}
      catalogWarnings={props.catalogWarnings}
      canStart={canStart}
      onBack={props.onExit}
      onOpenSettings={props.onOpenSettings}
      onTeamsChange={(teams) => props.dispatch({ type: "replace-teams", teams })}
      onTeamRename={(teamId, name) => props.dispatch({
        type: "rename-team",
        teamId,
        name,
      })}
      onThemeToggle={(themeId) => props.dispatch({ type: "toggle-theme", themeId })}
      onWordCountChange={(count) => props.dispatch({ type: "set-word-count", count })}
      onDurationChange={(seconds) => props.dispatch({ type: "set-duration", seconds })}
      onStart={start}
    />
  );
}

function reviewScreen(props: HatScreenRouterProps) {
  if (props.state.phase !== "review") return null;
  const { draft, end, session } = props.state;
  const confirm = () => {
    const remainingWordIds = reviewedWordQueue(
      draft.queueWordIds,
      draft.correctClaims,
    );
    const needsAutomaticStage = remainingWordIds.length === 0
      && end.remainingMs === 0
      && session.stageIndex < 2;
    props.dispatch({
      type: "confirm-review",
      remainingWordIds,
      ...(needsAutomaticStage
        ? { nextStageWordIds: freshStageQueue(session) }
        : {}),
    });
  };
  return (
    <TurnReviewScreen
      session={session}
      draft={draft}
      onToggle={(wordId) => props.dispatch({ type: "toggle-claim", wordId })}
      onConfirm={confirm}
      onExit={props.onExit}
      onOpenSettings={props.onOpenSettings}
    />
  );
}

function freshStageQueue(session: HatSession): string[] {
  return shuffleWordIds(session.masterWords.map((word) => word.id));
}

interface HatCatalogStateProps {
  onExit: () => void;
  onOpenSettings: () => void;
}

function HatCatalogLoading(props: HatCatalogStateProps) {
  return (
    <AppShell ariaLabel="Загрузка Шляпы">
      <ScreenHeader
        title="Шляпа"
        onBack={props.onExit}
        trailingAction={<SettingsButton onClick={props.onOpenSettings} />}
      />
      <Card><p>Загружаем темы…</p></Card>
    </AppShell>
  );
}

function HatCatalogError(props: HatCatalogStateProps) {
  return (
    <AppShell ariaLabel="Ошибка Шляпы">
      <ScreenHeader
        title="Шляпа"
        onBack={props.onExit}
        trailingAction={<SettingsButton onClick={props.onOpenSettings} />}
      />
      <Card><p role="alert">Не удалось загрузить ни одной темы.</p></Card>
    </AppShell>
  );
}
