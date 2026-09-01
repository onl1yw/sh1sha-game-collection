import type { AliasSetup, AliasTeam } from "./types";

export const ALIAS_LIMITS = {
  minTeams: 1,
  maxTeams: 8,
  minDurationSeconds: 10,
  maxDurationSeconds: 180,
  minTargetPoints: 5,
  maxTargetPoints: 100,
  minRounds: 1,
  maxRounds: 20,
} as const;

export function createTeam(index: number): AliasTeam {
  return { id: `team-${index + 1}`, name: `Команда ${index + 1}` };
}

export function createInitialSetup(themeIds: readonly string[]): AliasSetup {
  const preferredTheme = themeIds.includes("cinema") ? "cinema" : themeIds[0];
  return {
    teams: [createTeam(0), createTeam(1)],
    selectedThemeIds: preferredTheme ? [preferredTheme] : [],
    durationSeconds: 60,
    penalizeSkips: false,
    winCondition: { type: "points", target: 30 },
  };
}

export function setupIsValid(setup: AliasSetup): boolean {
  const names = setup.teams.map((team) => team.name.trim().toLocaleLowerCase("ru"));
  return (
    setup.teams.length >= ALIAS_LIMITS.minTeams &&
    setup.teams.length <= ALIAS_LIMITS.maxTeams &&
    names.every(Boolean) &&
    new Set(names).size === names.length &&
    setup.selectedThemeIds.length > 0 &&
    setup.durationSeconds >= ALIAS_LIMITS.minDurationSeconds &&
    setup.durationSeconds <= ALIAS_LIMITS.maxDurationSeconds
  );
}
