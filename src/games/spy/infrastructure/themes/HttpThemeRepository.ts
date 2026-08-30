import type {
  CatalogTheme,
  ThemeCatalogResult,
  ThemeLoadError,
  ThemeRepository,
} from "../../app/ports/themeRepository";
import type {
  ThemeManifest,
  ThemeManifestEntry,
} from "../../domain/theme/types";
import { validateTheme } from "../../domain/theme/validateTheme";

type Fetcher = typeof fetch;

interface JsonResult {
  data?: unknown;
  error?: ThemeLoadError;
}

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FILE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/;
const MANIFEST_KEYS = ["schemaVersion", "themes"];
const MANIFEST_ENTRY_KEYS = ["id", "file", "enabled", "sensitive"];

export class HttpThemeRepository implements ThemeRepository {
  public constructor(
    private readonly baseUrl = "./games/spy/themes",
    private readonly fetcher: Fetcher = globalThis.fetch.bind(globalThis),
  ) {}

  public async loadThemes(signal?: AbortSignal): Promise<ThemeCatalogResult> {
    const manifestResult = await this.fetchJson(
      this.pathFor("manifest.json"),
      signal,
    );
    if (manifestResult.error) {
      return { themes: [], errors: [manifestResult.error] };
    }

    const manifestResultParsed = parseManifest(manifestResult.data);
    if (!manifestResultParsed.manifest) {
      return { themes: [], errors: manifestResultParsed.errors };
    }

    const enabledEntries = manifestResultParsed.manifest.themes.filter(
      (entry) => entry.enabled,
    );
    const loaded = await Promise.all(
      enabledEntries.map((entry) => this.loadTheme(entry, signal)),
    );

    return {
      themes: loaded.flatMap((result) => (result.theme ? [result.theme] : [])),
      errors: [
        ...manifestResultParsed.errors,
        ...loaded.flatMap((result) => result.errors),
      ],
    };
  }

  private async loadTheme(
    entry: ThemeManifestEntry,
    signal?: AbortSignal,
  ): Promise<{ theme?: CatalogTheme; errors: ThemeLoadError[] }> {
    const jsonResult = await this.fetchJson(this.pathFor(entry.file), signal);
    if (jsonResult.error) {
      return { errors: [{ ...jsonResult.error, themeId: entry.id }] };
    }

    const validation = validateTheme(jsonResult.data);
    if (!validation.success) {
      return {
        errors: [
          {
            code: "invalid-theme",
            themeId: entry.id,
            message: validation.errors
              .map((issue) => `${issue.path}: ${issue.message}`)
              .join("; "),
          },
        ],
      };
    }
    if (validation.data.id !== entry.id) {
      return {
        errors: [
          {
            code: "invalid-theme",
            themeId: entry.id,
            message: `Theme id ${validation.data.id} does not match the manifest`,
          },
        ],
      };
    }

    return {
      theme: {
        ...validation.data,
        sensitive: entry.sensitive ?? false,
      },
      errors: [],
    };
  }

  private async fetchJson(
    url: string,
    signal?: AbortSignal,
  ): Promise<JsonResult> {
    let response: Response;
    try {
      const options = signal ? { signal } : undefined;
      response = await this.fetcher(url, options);
    } catch {
      return {
        error: { code: "network", message: `Could not load ${url}` },
      };
    }

    if (!response.ok) {
      return {
        error: {
          code: "http",
          message: `Could not load ${url}: HTTP ${response.status}`,
        },
      };
    }

    try {
      return { data: (await response.json()) as unknown };
    } catch {
      return {
        error: { code: "invalid-json", message: `${url} is not valid JSON` },
      };
    }
  }

  private pathFor(file: string): string {
    return `${this.baseUrl.replace(/\/$/, "")}/${file}`;
  }
}

interface ManifestParseResult {
  manifest?: ThemeManifest;
  errors: ThemeLoadError[];
}

function parseManifest(input: unknown): ManifestParseResult {
  if (
    !isRecord(input) ||
    !hasOnlyKeys(input, MANIFEST_KEYS) ||
    input.schemaVersion !== 1 ||
    !Array.isArray(input.themes)
  ) {
    return invalidManifest("Manifest must use schemaVersion 1 and contain themes");
  }

  const entries: ThemeManifestEntry[] = [];
  const errors: ThemeLoadError[] = [];
  const knownIds = new Set<string>();
  const knownFiles = new Set<string>();

  input.themes.forEach((value, index) => {
    if (!isManifestEntry(value)) {
      errors.push({
        code: "invalid-manifest",
        message: `Manifest entry ${index + 1} is invalid`,
      });
      return;
    }
    if (knownIds.has(value.id) || knownFiles.has(value.file)) {
      errors.push({
        code: "invalid-manifest",
        themeId: value.id,
        message: `Duplicate theme id or file for ${value.id}`,
      });
      return;
    }

    knownIds.add(value.id);
    knownFiles.add(value.file);
    entries.push(value);
  });

  return {
    manifest: { schemaVersion: 1, themes: entries },
    errors,
  };
}

function isManifestEntry(value: unknown): value is ThemeManifestEntry {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, MANIFEST_ENTRY_KEYS) &&
    typeof value.id === "string" &&
    ID_PATTERN.test(value.id) &&
    typeof value.file === "string" &&
    FILE_PATTERN.test(value.file) &&
    typeof value.enabled === "boolean" &&
    (value.sensitive === undefined || typeof value.sensitive === "boolean")
  );
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function invalidManifest(message: string): ManifestParseResult {
  return { errors: [{ code: "invalid-manifest", message }] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
