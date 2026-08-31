import type { AliasSession, RoundWord } from "./types";

export function roundScore(entries: readonly RoundWord[], penalizeSkips: boolean): number {
  const correct = entries.filter((entry) => entry.outcome === "correct").length;
  const skipped = entries.length - correct;
  return correct - (penalizeSkips ? skipped : 0);
}

export function gameIsFinished(session: AliasSession): boolean {
  const condition = session.setup.winCondition;
  if (condition.type === "points") {
    return Object.values(session.scores).some(
      (score) => score >= condition.target,
    );
  }
  return session.setup.teams.every(
    (team) => (session.roundsPlayed[team.id] ?? 0)
      >= condition.roundsPerTeam,
  );
}

export function leadingTeamIds(session: AliasSession): string[] {
  const best = Math.max(...Object.values(session.scores));
  return session.setup.teams
    .filter((team) => session.scores[team.id] === best)
    .map((team) => team.id);
}
