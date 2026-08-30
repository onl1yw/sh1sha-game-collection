import type { GameRound, RoleAssignment } from "../domain/game/types";
import type { Player } from "../domain/player/types";
import { GameSetupScreen } from "../features/game-setup/GameSetupScreen";
import type { RevealedRole } from "../features/role-reveal/RoleRevealScreen";
import { RoleRevealScreen } from "../features/role-reveal/RoleRevealScreen";
import { ActiveRoundScreen } from "../features/round/ActiveRoundScreen";
import { ResultsScreen } from "../features/round/ResultsScreen";
import { RoundReadyScreen } from "../features/round/RoundReadyScreen";
import { ThemeSelectionScreen } from "../features/theme-selection/ThemeSelectionScreen";
import { LoadingScreen } from "./LoadingScreen";
import { filterVisibleThemes } from "./filterThemes";
import { RecoveryScreen } from "./RecoveryScreen";
import { useGame } from "./state/useGame";

export interface SpyScreenRouterProps {
  onExit: () => void;
  onOpenSettings: () => void;
  showSensitiveThemes: boolean;
}

export function SpyScreenRouter({
  onExit,
  onOpenSettings,
  showSensitiveThemes,
}: SpyScreenRouterProps) {
  const { state, actions } = useGame();

  if (state.phase === "theme-selection") {
    const catalogFailed = state.catalog.status === "error";
    const visibleThemes = filterVisibleThemes(
      state.catalog.themes,
      showSensitiveThemes,
    );
    return (
      <ThemeSelectionScreen
        themes={visibleThemes}
        isLoading={state.catalog.status === "idle" || state.catalog.status === "loading"}
        {...(catalogFailed || state.errorMessage
          ? {
              errorMessage:
                state.errorMessage ?? "Не удалось загрузить тематики.",
              onRetry: () => void actions.reloadThemes(),
            }
          : {})}
        onChooseTheme={actions.chooseTheme}
        onBack={onExit}
        onOpenSettings={onOpenSettings}
      />
    );
  }

  const selectedTheme = state.catalog.themes.find(
    (theme) => theme.id === state.selectedThemeId,
  );

  if (state.phase === "setup") {
    if (state.catalog.status === "idle" || state.catalog.status === "loading") {
      return <LoadingScreen />;
    }
    if (!selectedTheme) {
      return recovery("Выбранная тематика больше недоступна", actions.resetGame);
    }
    return (
      <GameSetupScreen
        themeName={selectedTheme.name}
        players={state.players}
        spyCount={state.settings.spyCount}
        spyMode={state.settings.spyMode}
        {...(state.errorMessage ? { errorMessage: state.errorMessage } : {})}
        onPlayerCountChange={actions.setPlayerCount}
        onPlayerNameChange={actions.setPlayerName}
        onSpyCountChange={actions.setSpyCount}
        onSpyModeChange={actions.setSpyMode}
        onBack={actions.backToThemes}
        onStart={actions.startRound}
        onResetHistory={actions.resetHistory}
      />
    );
  }

  if (!state.round) {
    return recovery("Данные раунда не сохранились", actions.resetGame);
  }

  if (state.catalog.status === "idle" || state.catalog.status === "loading") {
    return <LoadingScreen />;
  }

  const roundTheme = state.catalog.themes.find(
    (theme) => theme.id === state.round?.themeId,
  );
  if (!roundTheme) {
    return recovery("Тематика раунда больше недоступна", actions.resetGame);
  }

  const firstPlayer = findPlayer(state.players, state.round.firstPlayerId);
  if (!firstPlayer) {
    return recovery("Не найден игрок, начинающий раунд", actions.resetGame);
  }

  if (state.phase === "handoff" || state.phase === "role") {
    const player = state.players[state.currentPlayerIndex];
    const assignment = state.round.assignments[state.currentPlayerIndex];
    if (!player || !assignment || player.id !== assignment.playerId) {
      return recovery("Порядок раздачи повреждён", actions.resetGame);
    }

    const role = state.phase === "role"
      ? visibleRole(state.round, assignment)
      : null;
    if (state.phase === "role" && !role) {
      return recovery("Не удалось показать роль", actions.resetGame);
    }

    const revealState = state.phase === "role" && role
      ? { isRevealed: true as const, role }
      : { isRevealed: false as const };
    return (
      <RoleRevealScreen
        playerName={player.name}
        themeName={roundTheme.name}
        onReveal={actions.revealRole}
        onHide={actions.hideRole}
        onCancel={actions.cancelRound}
        {...revealState}
      />
    );
  }

  if (state.phase === "ready") {
    return (
      <RoundReadyScreen
        firstPlayerName={firstPlayer.name}
        themeName={roundTheme.name}
        onStart={actions.startPlaying}
      />
    );
  }

  if (state.phase === "active") {
    return (
      <ActiveRoundScreen
        firstPlayerName={firstPlayer.name}
        themeName={roundTheme.name}
        {...(state.roundStartedAtMs === null
          ? {}
          : { startedAtMs: state.roundStartedAtMs })}
        onFinishRound={actions.showResults}
      />
    );
  }

  const spies = state.round.assignments
    .filter((assignment) => assignment.role === "spy")
    .map((assignment) => findPlayer(state.players, assignment.playerId))
    .filter((player): player is Player => player !== undefined);

  return (
    <ResultsScreen
      secretWord={state.round.targetWord}
      {...(state.round.decoyWord ? { decoyWord: state.round.decoyWord } : {})}
      spies={spies}
      onPlayAgain={actions.playAgain}
      onNewGame={actions.newGame}
    />
  );
}

function visibleRole(
  round: GameRound,
  assignment: RoleAssignment,
): RevealedRole | null {
  if (round.spyMode === "classic" && assignment.role === "spy") {
    return { kind: "spy" };
  }
  return assignment.displayedWord
    ? { kind: "word", word: assignment.displayedWord }
    : null;
}

function findPlayer(players: readonly Player[], id: string): Player | undefined {
  return players.find((player) => player.id === id);
}

function recovery(message: string, onReset: () => void) {
  return <RecoveryScreen message={message} onReset={onReset} />;
}
