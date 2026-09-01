import { wordAt } from "../../domain/deck";
import { gameIsFinished, roundScore } from "../../domain/scoring";
import type { AliasGameState, AliasSession, AliasSetup } from "../../domain/types";
import type { AliasGameAction } from "./gameActions";

export function aliasGameReducer(
  state: AliasGameState,
  action: AliasGameAction,
): AliasGameState {
  if (action.type === "reset-setup") return { phase: "setup", setup: action.setup };
  if (action.type === "play-again") {
    return { phase: "setup", setup: state.phase === "setup" ? state.setup : state.session.setup };
  }
  if (state.phase === "setup") return reduceSetup(state.setup, action);
  if (action.type === "start-round" && state.phase === "ready") {
    return { phase: "round", session: state.session, entries: [] };
  }
  if (action.type === "record-word" && state.phase === "round") {
    const word = wordAt(state.session.deck, state.session.cursor);
    const exhausted = state.session.cursor + 1 >= state.session.deck.length;
    const nextDeck = exhausted && action.nextDeck?.length
      ? action.nextDeck
      : state.session.deck;
    return {
      ...state,
      session: {
        ...state.session,
        deck: nextDeck,
        cursor: exhausted ? 0 : state.session.cursor + 1,
      },
      entries: [
        ...state.entries,
        {
          id: `round-${state.session.roundNumber}-word-${state.entries.length + 1}`,
          word,
          outcome: action.outcome,
        },
      ],
    };
  }
  if (action.type === "finish-round" && state.phase === "round") {
    return { phase: "review", session: state.session, entries: state.entries };
  }
  if (action.type === "toggle-result" && state.phase === "review") {
    return {
      ...state,
      entries: state.entries.map((entry) => entry.id === action.entryId
        ? { ...entry, outcome: entry.outcome === "correct" ? "skipped" : "correct" }
        : entry),
    };
  }
  if (action.type === "confirm-review" && state.phase === "review") {
    return confirmReview(state.session, state.entries);
  }
  return state;
}

function reduceSetup(
  setup: AliasSetup,
  action: AliasGameAction,
): AliasGameState {
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
  if (action.type === "set-duration") {
    return setupState(setup, { durationSeconds: action.seconds });
  }
  if (action.type === "set-skip-penalty") {
    return setupState(setup, { penalizeSkips: action.enabled });
  }
  if (action.type === "set-win-condition") {
    return setupState(setup, { winCondition: action.winCondition });
  }
  if (action.type === "start-game" && action.deck.length > 0) {
    return { phase: "ready", session: createSession(setup, action.deck) };
  }
  return { phase: "setup", setup };
}

function setupState(setup: AliasSetup, patch: Partial<AliasSetup>): AliasGameState {
  return { phase: "setup", setup: { ...setup, ...patch } };
}

function createSession(setup: AliasSetup, deck: AliasSession["deck"]): AliasSession {
  return {
    setup,
    deck,
    cursor: 0,
    scores: Object.fromEntries(setup.teams.map((team) => [team.id, 0])),
    roundsPlayed: Object.fromEntries(setup.teams.map((team) => [team.id, 0])),
    activeTeamIndex: 0,
    roundNumber: 1,
  };
}

function confirmReview(
  session: AliasSession,
  entries: Extract<AliasGameState, { phase: "review" }>["entries"],
): AliasGameState {
  const team = session.setup.teams[session.activeTeamIndex];
  if (!team) return { phase: "results", session };
  const updated: AliasSession = {
    ...session,
    scores: {
      ...session.scores,
      [team.id]: (session.scores[team.id] ?? 0)
        + roundScore(entries, session.setup.penalizeSkips),
    },
    roundsPlayed: {
      ...session.roundsPlayed,
      [team.id]: (session.roundsPlayed[team.id] ?? 0) + 1,
    },
  };
  if (gameIsFinished(updated)) return { phase: "results", session: updated };
  return {
    phase: "ready",
    session: {
      ...updated,
      activeTeamIndex: (updated.activeTeamIndex + 1) % updated.setup.teams.length,
      roundNumber: updated.roundNumber + 1,
    },
  };
}
