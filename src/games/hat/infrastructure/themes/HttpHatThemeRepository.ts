import type { HatThemeRepository } from "../../app/ports/themeRepository";
import {
  parseHatManifest,
  parseHatTheme,
  type HatTheme,
  type HatThemeLoadResult,
  type HatThemeManifestEntry,
} from "../../domain/theme";

type Fetcher = typeof fetch;

export class HttpHatThemeRepository implements HatThemeRepository {
  public constructor(
    private readonly baseUrl = "./games/hat/themes",
    private readonly fetcher: Fetcher = globalThis.fetch.bind(globalThis),
  ) {}

  public async loadThemes(signal?: AbortSignal): Promise<HatThemeLoadResult> {
    const entries = parseHatManifest(await this.fetchJson("manifest.json", signal));
    if (!entries) return { themes: [], errors: ["Не удалось прочитать каталог Шляпы"] };

    const results = await Promise.all(entries.filter((entry) => entry.enabled)
      .map((entry) => this.loadTheme(entry, signal)));
    return {
      themes: results.flatMap((result) => result.theme ? [result.theme] : []),
      errors: results.flatMap((result) => result.error ? [result.error] : []),
    };
  }

  private async loadTheme(
    entry: HatThemeManifestEntry,
    signal?: AbortSignal,
  ): Promise<{ theme?: HatTheme; error?: string }> {
    const parsed = parseHatTheme(await this.fetchJson(entry.file, signal));
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
