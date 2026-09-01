import { HAT_STAGES, type CorrectClaim, type HatSession, type HatSetup, type HatStage, type HatWord, type TurnDraft } from "../../domain/types";

export function createHatSession(
  setup: HatSetup,
  masterWords: readonly HatWord[],
): HatSession {
  const teamValues = () => Object.fromEntries(
    setup.teams.map((team) => [team.id, 0]),
  );
  return {
    setup,
    masterWords: [...masterWords],
    stageIndex: 0,
    remainingWordIds: masterWords.map((word) => word.id),
    activeTeamIndex: 0,
    scores: teamValues(),
    stageScores: {
      describe: teamValues(),
      gestures: teamValues(),
      "one-word": teamValues(),
    },
    timeCreditsMs: teamValues(),
    turnsStarted: teamValues(),
    activePlayMs: { describe: 0, gestures: 0, "one-word": 0 },
  };
}

export function beginHatTurn(session: HatSession): {
  session: HatSession;
  draft: TurnDraft;
} | null {
  const team = session.setup.teams[session.activeTeamIndex];
  if (!team || session.remainingWordIds.length === 0) return null;
  const credit = session.timeCreditsMs[team.id] ?? 0;
  const budget = session.setup.durationSeconds * 1_000 + credit;
  return {
    session: {
      ...session,
      timeCreditsMs: { ...session.timeCreditsMs, [team.id]: 0 },
      turnsStarted: {
        ...session.turnsStarted,
        [team.id]: (session.turnsStarted[team.id] ?? 0) + 1,
      },
    },
    draft: createTurnDraft(team.id, budget, session.remainingWordIds),
  };
}

export function createTurnDraft(
  teamId: string,
  budgetMs: number,
  queueWordIds: readonly string[],
): TurnDraft {
  return {
    teamId,
    segmentBudgetMs: budgetMs,
    queueWordIds: [...queueWordIds],
    correctClaims: [],
    skippedAttempts: 0,
  };
}

export function commitHatReview(
  session: HatSession,
  draft: TurnDraft,
  remainingWordIds: readonly string[],
  remainingMs: number,
): HatSession {
  const points = draft.correctClaims.filter((claim) => claim.included).length;
  const stage = HAT_STAGES[session.stageIndex];
  const spentMs = draft.segmentBudgetMs - remainingMs;
  return {
    ...session,
    remainingWordIds: [...remainingWordIds],
    scores: addTeamValue(session.scores, draft.teamId, points),
    stageScores: {
      ...session.stageScores,
      [stage]: addTeamValue(session.stageScores[stage], draft.teamId, points),
    },
    activePlayMs: {
      ...session.activePlayMs,
      [stage]: session.activePlayMs[stage] + spentMs,
    },
  };
}

export function rotateHatTeam(session: HatSession): HatSession {
  return {
    ...session,
    activeTeamIndex: (session.activeTeamIndex + 1) % session.setup.teams.length,
  };
}

export function advanceHatStage(
  session: HatSession,
  nextStageWordIds: readonly string[],
): HatSession | null {
  if (session.stageIndex >= HAT_STAGES.length - 1) return null;
  return {
    ...session,
    stageIndex: (session.stageIndex + 1) as HatSession["stageIndex"],
    remainingWordIds: [...nextStageWordIds],
  };
}

export function addHatTimeCredit(
  session: HatSession,
  teamId: string,
  creditMs: number,
): HatSession {
  return {
    ...session,
    timeCreditsMs: {
      ...session.timeCreditsMs,
      [teamId]: (session.timeCreditsMs[teamId] ?? 0) + creditMs,
    },
  };
}

export function unresolvedReviewWordIds(
  draft: TurnDraft,
): string[] {
  return [
    ...draft.queueWordIds,
    ...draft.correctClaims
      .filter((claim: CorrectClaim) => !claim.included)
      .map((claim) => claim.wordId),
  ];
}

export function currentHatStage(session: HatSession): HatStage {
  return HAT_STAGES[session.stageIndex];
}

function addTeamValue(
  values: Record<string, number>,
  teamId: string,
  amount: number,
): Record<string, number> {
  return { ...values, [teamId]: (values[teamId] ?? 0) + amount };
}
