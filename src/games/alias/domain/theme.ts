export interface AliasTheme {
  schemaVersion: 1;
  id: string;
  name: string;
  description: string;
  words: string[];
  sensitive: boolean;
}

export interface AliasThemeManifestEntry {
  id: string;
  file: string;
  enabled: boolean;
  sensitive?: boolean;
}

export interface AliasThemeLoadResult {
  themes: AliasTheme[];
  errors: string[];
}

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const THEME_KEYS = ["schemaVersion", "id", "name", "description", "words"];
const MANIFEST_KEYS = ["schemaVersion", "themes"];
const ENTRY_KEYS = ["id", "file", "enabled", "sensitive"];

export function parseAliasTheme(input: unknown): Omit<AliasTheme, "sensitive"> | null {
  if (!isRecord(input) || !hasOnlyKeys(input, THEME_KEYS) || input.schemaVersion !== 1) {
    return null;
  }
  if (
    typeof input.id !== "string"
    || input.id.length > 64
    || !ID_PATTERN.test(input.id)
  ) return null;
  if (typeof input.name !== "string" || !input.name.trim() || input.name.length > 80) {
    return null;
  }
  if (typeof input.description !== "string" || input.description.length > 200) return null;
  if (!Array.isArray(input.words) || input.words.length < 10 || input.words.length > 300) {
    return null;
  }
  if (!input.words.every((word) => (
    typeof word === "string" && Boolean(word.trim()) && word.length <= 80
  ))) return null;
  const words = input.words.map((word) => word.trim());
  const normalized = words.map((word) => word.toLocaleLowerCase("ru"));
  if (new Set(normalized).size !== normalized.length) return null;
  return {
    schemaVersion: 1,
    id: input.id,
    name: input.name.trim(),
    description: input.description.trim(),
    words,
  };
}

export function parseAliasManifest(input: unknown): AliasThemeManifestEntry[] | null {
  if (
    !isRecord(input)
    || !hasOnlyKeys(input, MANIFEST_KEYS)
    || input.schemaVersion !== 1
    || !Array.isArray(input.themes)
  ) {
    return null;
  }
  const entries = input.themes.filter(isManifestEntry);
  if (entries.length !== input.themes.length || entries.length === 0) return null;
  if (new Set(entries.map((entry) => entry.id)).size !== entries.length) return null;
  if (new Set(entries.map((entry) => entry.file)).size !== entries.length) return null;
  return entries;
}

function isManifestEntry(value: unknown): value is AliasThemeManifestEntry {
  return isRecord(value)
    && hasOnlyKeys(value, ENTRY_KEYS)
    && typeof value.id === "string"
    && value.id.length <= 64
    && ID_PATTERN.test(value.id)
    && typeof value.file === "string"
    && /^[a-z0-9-]+\.json$/.test(value.file)
    && typeof value.enabled === "boolean"
    && (value.sensitive === undefined || typeof value.sensitive === "boolean");
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
