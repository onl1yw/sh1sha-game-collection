import { isWordIdPermutation } from "../../domain/pool";
import { hatSetupIsValid } from "../../domain/setup";
import type {
  HatGameState,
  HatSession,
  HatSetup,
  HatWord,
} from "../../domain/types";
import type { HatGameAction } from "./gameActions";
import {
  addHatTimeCredit,
  advanceHatStage,
  beginHatTurn,
  commitHatReview,
  createHatSession,
  createTurnDraft,
  rotateHatTeam,
  unresolvedReviewWordIds,
} from "./sessionTransitions";

export function hatGameReducer(
  state: HatGameState,
  action: HatGameAction,
): HatGameState {
  if (action.type === "reset-setup") return { phase: "setup", setup: action.setup };
  if (action.type === "play-again") {
    return {
      phase: "setup",
      setup: state.phase === "setup" ? state.setup : state.session.setup,
    };
  }
  if (state.phase === "setup") return reduceHatSetup(state.setup, action);
  if (state.phase === "ready" && action.type === "start-turn") {
    const turn = beginHatTurn(state.session);
    return turn ? { phase: "turn", ...turn } : state;
  }
  if (state.phase === "turn") return reduceHatTurn(state, action);
  if (state.phase === "review") return reduceHatReview(state, action);
  if (state.phase === "stage-choice") return reduceStageChoice(state, action);
  return state;
}

function reduceHatSetup(setup: HatSetup, action: HatGameAction): HatGameState {
  if (action.type === "replace-teams") return setupState(setup, { teams: action.teams });
  if (action.type === "rename-team") {
    return setupState(setup, {
      teams: setup.teams.map((team) => team.id === action.teamId
        ? { ...team, name: action.name }
        : team),
    });
  }
  if (action.type === "toggle-theme") {
    const selected = setup.selectedThemeIds.includes(action.themeId)
      ? setup.selectedThemeIds.filter((id) => id !== action.themeId)
      : [...setup.selectedThemeIds, action.themeId];
    return setupState(setup, { selectedThemeIds: selected });
  }
  if (action.type === "set-word-count") {
    return setupState(setup, { wordCount: action.count });
  }
  if (action.type === "set-duration") {
    return setupState(setup, { durationSeconds: action.seconds });
  }
  if (action.type === "start-game" && validMasterPool(setup, action.masterWords)) {
    return { phase: "ready", session: createHatSession(setup, action.masterWords) };
  }
  return { phase: "setup", setup };
}

function reduceHatTurn(
  state: Extract<HatGameState, { phase: "turn" }>,
  action: HatGameAction,
): HatGameState {
  if (action.type === "skip-word") {
    const current = state.draft.queueWordIds[0];
    const valid = current
      && isWordIdPermutation(action.queueWordIds, state.draft.queueWordIds)
      && (state.draft.queueWordIds.length === 1 || action.queueWordIds[0] !== current);
    if (!valid) return state;
    return {
      ...state,
      draft: {
        ...state.draft,
        queueWordIds: [...action.queueWordIds],
        skippedAttempts: state.draft.skippedAttempts + 1,
      },
    };
  }
  if (action.type === "mark-correct") {
    const current = state.draft.queueWordIds[0];
    if (!current || !validRemainingMs(action.remainingMs, state.draft.segmentBudgetMs)) {
      return state;
    }
    const draft = {
      ...state.draft,
      queueWordIds: state.draft.queueWordIds.slice(1),
      correctClaims: [
        ...state.draft.correctClaims,
        { wordId: current, included: true },
      ],
    };
    return draft.queueWordIds.length === 0
      ? {
        phase: "review",
        session: state.session,
        draft,
        end: { reason: "pool-empty", remainingMs: action.remainingMs },
      }
      : { ...state, draft };
  }
  if (action.type === "expire-turn") {
    return {
      phase: "review",
      session: state.session,
      draft: state.draft,
      end: { reason: "timeout", remainingMs: 0 },
    };
  }
  return state;
}

function reduceHatReview(
  state: Extract<HatGameState, { phase: "review" }>,
  action: HatGameAction,
): HatGameState {
  if (action.type === "toggle-claim") {
    if (!state.draft.correctClaims.some((claim) => claim.wordId === action.wordId)) {
      return state;
    }
    return {
      ...state,
      draft: {
        ...state.draft,
        correctClaims: state.draft.correctClaims.map((claim) => (
          claim.wordId === action.wordId
            ? { ...claim, included: !claim.included }
            : claim
        )),
      },
    };
  }
  if (action.type !== "confirm-review") return state;
  const unresolved = unresolvedReviewWordIds(state.draft);
  if (!isWordIdPermutation(action.remainingWordIds, unresolved)) return state;
  const session = commitHatReview(
    state.session,
    state.draft,
    action.remainingWordIds,
    state.end.remainingMs,
  );
  if (session.remainingWordIds.length > 0) {
    if (state.end.reason === "pool-empty" && state.end.remainingMs > 0) {
      return {
        phase: "turn",
        session,
        draft: createTurnDraft(
          state.draft.teamId,
          state.end.remainingMs,
          session.remainingWordIds,
        ),
      };
    }
    return { phase: "ready", session: rotateHatTeam(session) };
  }
  if (session.stageIndex === 2) return { phase: "results", session };
  if (state.end.remainingMs > 0) {
    return { phase: "stage-choice", session, remainingMs: state.end.remainingMs };
  }
  const advanced = validNextStage(session, action.nextStageWordIds)
    ? advanceHatStage(session, action.nextStageWordIds ?? [])
    : null;
  return advanced
    ? { phase: "ready", session: rotateHatTeam(advanced) }
    : state;
}

function reduceStageChoice(
  state: Extract<HatGameState, { phase: "stage-choice" }>,
  action: HatGameAction,
): HatGameState {
  if (
    action.type !== "continue-next-stage"
    && action.type !== "carry-stage-time"
  ) return state;
  if (!validNextStage(state.session, action.nextStageWordIds)) return state;
  const advanced = advanceHatStage(state.session, action.nextStageWordIds);
  if (!advanced) return state;
  const team = state.session.setup.teams[state.session.activeTeamIndex];
  if (!team) return state;
  if (action.type === "continue-next-stage") {
    return {
      phase: "turn",
      session: advanced,
      draft: createTurnDraft(team.id, state.remainingMs, advanced.remainingWordIds),
    };
  }
  const credited = addHatTimeCredit(advanced, team.id, state.remainingMs);
  return { phase: "ready", session: rotateHatTeam(credited) };
}

function validMasterPool(setup: HatSetup, words: readonly HatWord[]): boolean {
  if (!hatSetupIsValid(setup, words.length) || words.length !== setup.wordCount) return false;
  const ids = new Set(words.map((word) => word.id));
  const texts = new Set(words.map((word) => word.text.trim().toLocaleLowerCase("ru")));
  return ids.size === words.length
    && texts.size === words.length
    && words.every((word) => word.text.trim()
      && setup.selectedThemeIds.includes(word.themeId));
}

function validNextStage(
  session: HatSession,
  next: readonly string[] | undefined,
): boolean {
  return Boolean(next && isWordIdPermutation(
    next,
    session.masterWords.map((word) => word.id),
  ));
}

function validRemainingMs(remainingMs: number, budgetMs: number): boolean {
  return Number.isInteger(remainingMs)
    && remainingMs >= 0
    && remainingMs <= budgetMs;
}

function setupState(setup: HatSetup, patch: Partial<HatSetup>): HatGameState {
  return { phase: "setup", setup: { ...setup, ...patch } };
}
