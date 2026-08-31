import { validateSetup } from "../domain/validateSetup";
import { instructionForNightStep, NIGHT_STEP_COPY } from "./nightCopy";
import {
  DUMMY_NIGHT_ACTION_DELAY_MS,
  NO_TARGET_NIGHT_ACTION_DELAY_MS,
} from "./state/nightTransitions";
import {
  assignmentByPlayerId,
  activePlayerCount,
  alivePlayers,
  civilianCount,
  currentNightStep,
  maxOrdinaryMafiaCount,
  nightTargetPlayers,
  playerById,
} from "./state/selectors";
import { useMafiaGame } from "./state/useMafiaGame";
import { DawnScreen } from "../features/day/DawnScreen";
import { DiscussionScreen } from "../features/day/DiscussionScreen";
import { EliminationScreen } from "../features/day/EliminationScreen";
import { VoteScreen } from "../features/day/VoteScreen";
import { NightActionScreen } from "../features/night/NightActionScreen";
import { NightCoverScreen } from "../features/night/NightCoverScreen";
import { NightTransitionScreen } from "../features/night/NightTransitionScreen";
import { ResultsScreen } from "../features/results/ResultsScreen";
import { RoleDealScreen } from "../features/role-deal/RoleDealScreen";
import {
  iconForNightStep,
  presentationForRole,
} from "../features/rolePresentation";
import { MafiaRecoveryScreen } from "../features/shared/MafiaRecoveryScreen";
import { MafiaSetupScreen } from "../features/setup/MafiaSetupScreen";
import {
  MAX_MAFIA_PARTICIPANTS,
  MAX_MAFIA_PLAYERS,
  MIN_MAFIA_PLAYERS,
} from "../domain/roleSetup";

export interface MafiaScreenRouterProps {
  onExit: () => void;
  onOpenSettings: () => void;
}

export function MafiaScreenRouter({
  onExit,
  onOpenSettings,
}: MafiaScreenRouterProps) {
  const { state, actions, narrationAvailable, narrationAudible } = useMafiaGame();
  const phase = state.phase;

  if (phase.kind === "setup") {
    const validation = validateSetup(state.roleSetup);
    const errorMessage = state.errorMessage ?? validation.errors[0];
    return (
      <MafiaSetupScreen
        players={state.players}
        minPlayers={MIN_MAFIA_PLAYERS + (state.roleSetup.hostByLot ? 1 : 0)}
        maxPlayers={state.roleSetup.hostByLot
          ? MAX_MAFIA_PARTICIPANTS
          : MAX_MAFIA_PLAYERS}
        activePlayerCount={activePlayerCount(state)}
        canStart={validation.valid}
        ordinaryMafiaCount={state.roleSetup.ordinaryMafiaCount}
        maxOrdinaryMafia={maxOrdinaryMafiaCount(state)}
        civilianCount={civilianCount(state)}
        don={state.roleSetup.don === 1}
        commissioner={state.roleSetup.commissioner === 1}
        doctor={state.roleSetup.doctor === 1}
        lover={state.roleSetup.lover === 1}
        loverMode={state.roleSetup.loverMode}
        maniac={state.roleSetup.maniac === 1}
        hostByLot={state.roleSetup.hostByLot}
        revealRoles={state.roleSetup.deathReveal === "always"}
        {...(errorMessage ? { errorMessage } : {})}
        onPlayerCountChange={actions.setPlayerCount}
        onPlayerNameChange={actions.setPlayerName}
        onOrdinaryMafiaCountChange={actions.setMafiaCount}
        onDonChange={(enabled) => actions.setRoleEnabled("don", enabled)}
        onCommissionerChange={(enabled) => actions.setRoleEnabled("commissioner", enabled)}
        onDoctorChange={(enabled) => actions.setRoleEnabled("doctor", enabled)}
        onLoverChange={(enabled) => actions.setRoleEnabled("lover", enabled)}
        onLoverModeChange={actions.setLoverMode}
        onManiacChange={(enabled) => actions.setRoleEnabled("maniac", enabled)}
        onHostByLotChange={actions.setHostByLot}
        onRevealRolesChange={actions.setRevealRoles}
        onBack={onExit}
        onOpenSettings={onOpenSettings}
        onStart={actions.startGame}
      />
    );
  }

  if (phase.kind === "deal-cover" || phase.kind === "deal-role") {
    const player = state.players[phase.playerIndex];
    const assignment = player ? assignmentByPlayerId(state, player.id) : undefined;
    if (!player || !assignment) return recovery(actions.returnToSetup);
    return (
      <RoleDealScreen
        playerName={player.name}
        role={assignment.role}
        loverMode={state.roleSetup.loverMode}
        isRevealed={phase.kind === "deal-role"}
        isLastPlayer={phase.playerIndex === state.players.length - 1}
        onReveal={actions.revealRole}
        onHide={actions.hideRole}
        onCancel={actions.returnToSetup}
        onOpenSettings={onOpenSettings}
      />
    );
  }

  if (phase.kind === "night-cover") {
    return (
      <NightCoverScreen
        nightNumber={phase.nightNumber}
        hostByLot={state.roleSetup.hostByLot}
        narrationAvailable={narrationAvailable}
        soundEnabled={narrationAudible}
        onCancel={actions.returnToSetup}
        onOpenSettings={onOpenSettings}
        onStart={actions.startNight}
      />
    );
  }

  if (phase.kind === "night-step" || phase.kind === "night-feedback") {
    const step = currentNightStep(state);
    if (!step) return recovery(actions.returnToSetup);
    const copy = NIGHT_STEP_COPY[step.kind];
    const targets = nightTargetPlayers(state);
    const hasNoTargets = !step.isDummy && targets.length === 0;
    const paused = !state.roleSetup.hostByLot && !narrationAudible;
    const feedback = phase.kind === "night-feedback"
      ? checkFeedback(phase.result.kind, phase.result.positive)
      : undefined;
    const selectedId = phase.kind === "night-step"
      ? phase.selectedPlayerId
      : phase.result.targetPlayerId;
    return (
      <NightActionScreen
        nightNumber={phase.nightNumber}
        roleName={copy.roleName}
        instruction={instructionForNightStep(step.kind, state.roleSetup.loverMode)}
        Icon={iconForNightStep(step.kind)}
        tone={copy.tone}
        targets={targets}
        selectedId={selectedId}
        actionAvailable={!step.isDummy && phase.kind === "night-step"}
        paused={paused}
        {...(phase.kind === "night-step" && (step.isDummy || hasNoTargets)
          ? {
              autoContinueAfterMs: step.isDummy
                ? DUMMY_NIGHT_ACTION_DELAY_MS
                : NO_TARGET_NIGHT_ACTION_DELAY_MS,
            }
          : {})}
        {...(hasNoTargets
          ? { emptyStateMessage: "Нет доступных целей. Переходим к следующей роли." }
          : {})}
        {...(feedback ? { feedback } : {})}
        onSelect={actions.selectNightTarget}
        onConfirm={phase.kind === "night-feedback"
          ? actions.finishNightStep
          : actions.confirmNightAction}
        onWindowEnd={actions.finishNightStep}
        onCancel={actions.returnToSetup}
        onOpenSettings={onOpenSettings}
      />
    );
  }

  if (phase.kind === "night-transition") {
    return (
      <NightTransitionScreen
        nightNumber={phase.nightNumber}
        message={phase.message}
        delayMs={phase.delayMs}
        onContinue={actions.continueNight}
      />
    );
  }

  if (phase.kind === "dawn") {
    return (
      <DawnScreen
        nightNumber={phase.nightNumber}
        deaths={phase.eliminatedPlayerIds.map((id) => revealedPlayer(state, id))}
        onCancel={actions.returnToSetup}
        onOpenSettings={onOpenSettings}
        onContinue={actions.continueDawn}
      />
    );
  }

  if (phase.kind === "discussion") {
    return (
      <DiscussionScreen
        dayNumber={phase.dayNumber}
        aliveCount={state.alivePlayerIds.length}
        onOpenSettings={onOpenSettings}
        onVote={actions.startVote}
        onCancel={actions.returnToSetup}
      />
    );
  }

  if (phase.kind === "vote") {
    return (
      <VoteScreen
        dayNumber={phase.dayNumber}
        players={alivePlayers(state)}
        voteBlockedPlayerId={state.voteBlockedPlayerId}
        selectedId={phase.selectedPlayerId}
        onSelect={actions.selectVoteTarget}
        onOpenSettings={onOpenSettings}
        onBack={actions.backToDiscussion}
        onConfirm={actions.confirmVote}
      />
    );
  }

  if (phase.kind === "elimination") {
    return (
      <EliminationScreen
        dayNumber={phase.dayNumber}
        player={phase.playerId ? revealedPlayer(state, phase.playerId) : null}
        nextLabel={phase.pendingWinner ? "Показать результаты" : "Начать ночь"}
        onCancel={actions.returnToSetup}
        onOpenSettings={onOpenSettings}
        onContinue={actions.continueElimination}
      />
    );
  }

  return (
    <ResultsScreen
      winner={phase.winner}
      players={state.players.map((player) => ({
        ...player,
        role: assignmentByPlayerId(state, player.id)?.role ?? "civilian",
      }))}
      onOpenSettings={onOpenSettings}
      onPlayAgain={actions.returnToSetup}
      onExit={onExit}
    />
  );
}

function revealedPlayer(state: ReturnType<typeof useMafiaGame>["state"], id: string) {
  const player = playerById(state, id);
  const assignment = assignmentByPlayerId(state, id);
  return {
    id,
    name: player?.name ?? "Неизвестный игрок",
    ...(state.roleSetup.deathReveal === "always" && assignment
      ? {
          roleName: presentationForRole(assignment.role).name,
          role: assignment.role,
        }
      : {}),
  };
}

function checkFeedback(kind: "don-check" | "commissioner-check", positive: boolean) {
  if (kind === "don-check") {
    return {
      label: "Результат проверки",
      title: positive ? "Это комиссар" : "Не комиссар",
      danger: positive,
    };
  }
  return {
    label: "Результат проверки",
    title: positive ? "Это мафия" : "Не мафия",
    danger: positive,
  };
}

function recovery(onReset: () => void) {
  return <MafiaRecoveryScreen message="Данные партии повреждены" onReset={onReset} />;
}
