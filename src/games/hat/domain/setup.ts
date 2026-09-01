import type { HatSetup, HatTeam } from "./types";

export const HAT_LIMITS = {
  minTeams: 1,
  maxTeams: 8,
  minWords: 5,
  maxWords: 100,
  minDurationSeconds: 10,
  maxDurationSeconds: 180,
} as const;

export function createHatTeam(index: number): HatTeam {
  return { id: `team-${index + 1}`, name: `Команда ${index + 1}` };
}

export function createInitialHatSetup(themeIds: readonly string[]): HatSetup {
  return {
    teams: [createHatTeam(0), createHatTeam(1)],
    selectedThemeIds: [...new Set(themeIds.filter(Boolean))],
    wordCount: 30,
    durationSeconds: 60,
  };
}

export function hatSetupIsValid(
  setup: HatSetup,
  availableWordCount: number,
): boolean {
  const names = setup.teams.map((team) => normalizeTeamName(team.name));
  const teamIds = setup.teams.map((team) => team.id.trim());
  return (
    setup.teams.length >= HAT_LIMITS.minTeams
    && setup.teams.length <= HAT_LIMITS.maxTeams
    && names.every(Boolean)
    && new Set(names).size === names.length
    && teamIds.every(Boolean)
    && new Set(teamIds).size === teamIds.length
    && setup.selectedThemeIds.length > 0
    && Number.isInteger(setup.wordCount)
    && setup.wordCount >= HAT_LIMITS.minWords
    && setup.wordCount <= HAT_LIMITS.maxWords
    && setup.wordCount <= availableWordCount
    && Number.isInteger(setup.durationSeconds)
    && setup.durationSeconds >= HAT_LIMITS.minDurationSeconds
    && setup.durationSeconds <= HAT_LIMITS.maxDurationSeconds
  );
}

function normalizeTeamName(name: string): string {
  return name.trim().toLocaleLowerCase("ru");
}
