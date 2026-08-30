export interface ThemeManifestEntry {
  id: string;
  file: string;
  enabled: boolean;
  sensitive?: boolean;
}

export interface ThemeManifest {
  schemaVersion: 1;
  themes: ThemeManifestEntry[];
}

export interface ThemeGroup {
  id: string;
  name: string;
  items: string[];
}

export interface Theme {
  schemaVersion: 1;
  id: string;
  name: string;
  description: string;
  groups: ThemeGroup[];
}

export interface ThemeValidationIssue {
  path: string;
  message: string;
}

export type ThemeValidationResult =
  | { success: true; data: Theme }
  | { success: false; errors: ThemeValidationIssue[] };
