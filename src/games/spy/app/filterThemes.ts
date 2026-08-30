export interface SensitivityTagged {
  sensitive?: boolean;
}

export function filterVisibleThemes<T extends SensitivityTagged>(
  themes: readonly T[],
  showSensitiveThemes: boolean,
): readonly T[] {
  return showSensitiveThemes
    ? themes
    : themes.filter((theme) => !theme.sensitive);
}
