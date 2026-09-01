import { HAT_STAGES, type CorrectClaim, type HatSession } from "./types";

export function includedClaimCount(claims: readonly CorrectClaim[]): number {
  return claims.filter((claim) => claim.included).length;
}

export function leadingHatTeamIds(session: HatSession): string[] {
  const best = Math.max(...Object.values(session.scores));
  return session.setup.teams
    .filter((team) => session.scores[team.id] === best)
    .map((team) => team.id);
}

export function totalHatScore(session: HatSession): number {
  return Object.values(session.scores)
    .reduce((total, score) => total + score, 0);
}

export function expectedFinalHatScore(session: HatSession): number {
  return session.masterWords.length * HAT_STAGES.length;
}

export function finalHatScoreIsComplete(session: HatSession): boolean {
  return totalHatScore(session) === expectedFinalHatScore(session);
}
