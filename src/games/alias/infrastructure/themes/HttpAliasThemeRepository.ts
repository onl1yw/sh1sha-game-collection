import type { AliasThemeRepository } from "../../app/ports/themeRepository";
import {
  parseAliasManifest,
  parseAliasTheme,
  type AliasTheme,
  type AliasThemeLoadResult,
  type AliasThemeManifestEntry,
} from "../../domain/theme";

type Fetcher = typeof fetch;

export class HttpAliasThemeRepository implements AliasThemeRepository {
  public constructor(
    private readonly baseUrl = "./games/alias/themes",
    private readonly fetcher: Fetcher = globalThis.fetch.bind(globalThis),
  ) {}

  public async loadThemes(signal?: AbortSignal): Promise<AliasThemeLoadResult> {
    const manifestJson = await this.fetchJson("manifest.json", signal);
    const entries = parseAliasManifest(manifestJson);
    if (!entries) return { themes: [], errors: ["Не удалось прочитать каталог Alias"] };

    const results = await Promise.all(entries.filter((entry) => entry.enabled)
      .map((entry) => this.loadTheme(entry, signal)));
    return {
      themes: results.flatMap((result) => result.theme ? [result.theme] : []),
      errors: results.flatMap((result) => result.error ? [result.error] : []),
    };
  }

  private async loadTheme(
    entry: AliasThemeManifestEntry,
    signal?: AbortSignal,
  ): Promise<{ theme?: AliasTheme; error?: string }> {
    const parsed = parseAliasTheme(await this.fetchJson(entry.file, signal));
    if (!parsed || parsed.id !== entry.id) {
      return { error: `Тема «${entry.id}» пропущена: некорректный файл` };
    }
    return { theme: { ...parsed, sensitive: entry.sensitive ?? false } };
  }

  private async fetchJson(file: string, signal?: AbortSignal): Promise<unknown> {
    try {
      const response = await this.fetcher(
        `${this.baseUrl.replace(/\/$/, "")}/${file}`,
        signal ? { signal } : undefined,
      );
      if (!response.ok) return undefined;
      return await response.json() as unknown;
    } catch {
      return undefined;
    }
  }
}
