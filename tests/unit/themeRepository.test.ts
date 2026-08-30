import { describe, expect, it } from "vitest";
import { HttpThemeRepository } from "../../src/games/spy/infrastructure/themes/HttpThemeRepository";
import type { Theme } from "../../src/games/spy/domain/theme/types";

const validTheme: Theme = {
  schemaVersion: 1,
  id: "valid",
  name: "Рабочая тема",
  description: "Тема для теста",
  groups: [
    { id: "group", name: "Группа", items: ["Альфа", "Бета"] },
  ],
};

describe("HttpThemeRepository", () => {
  it("keeps valid themes when another enabled theme is invalid", async () => {
    const fetcher = createFetcher({
      "/themes/manifest.json": {
        schemaVersion: 1,
        themes: [
          { id: "valid", file: "valid.json", enabled: true },
          { id: "broken", file: "broken.json", enabled: true },
        ],
      },
      "/themes/valid.json": validTheme,
      "/themes/broken.json": {
        schemaVersion: 1,
        id: "broken",
        name: "Сломанная",
        description: "",
        groups: [],
      },
    });

    const result = await new HttpThemeRepository("/themes", fetcher).loadThemes();

    expect(result.themes.map((theme) => theme.id)).toEqual(["valid"]);
    expect(result.errors).toMatchObject([
      { code: "invalid-theme", themeId: "broken" },
    ]);
  });

  it("rejects a malformed manifest without fetching theme files", async () => {
    const calls: string[] = [];
    const fetcher = createFetcher(
      { "/themes/manifest.json": { schemaVersion: 2, themes: [] } },
      calls,
    );

    const result = await new HttpThemeRepository("/themes", fetcher).loadThemes();

    expect(result.themes).toEqual([]);
    expect(result.errors[0]?.code).toBe("invalid-manifest");
    expect(calls).toEqual(["/themes/manifest.json"]);
  });

  it.each([
    {
      label: "root",
      manifest: { schemaVersion: 1, themes: [], unexpected: true },
    },
    {
      label: "entry",
      manifest: {
        schemaVersion: 1,
        themes: [
          {
            id: "valid",
            file: "valid.json",
            enabled: true,
            unexpected: true,
          },
        ],
      },
    },
  ])("rejects unknown $label manifest fields", async ({ manifest }) => {
    const calls: string[] = [];
    const fetcher = createFetcher({ "/themes/manifest.json": manifest }, calls);

    const result = await new HttpThemeRepository("/themes", fetcher).loadThemes();

    expect(result.themes).toEqual([]);
    expect(result.errors[0]?.code).toBe("invalid-manifest");
    expect(calls).toEqual(["/themes/manifest.json"]);
  });

  it("does not fetch disabled themes", async () => {
    const calls: string[] = [];
    const fetcher = createFetcher(
      {
        "/themes/manifest.json": {
          schemaVersion: 1,
          themes: [{ id: "valid", file: "valid.json", enabled: false }],
        },
      },
      calls,
    );

    const result = await new HttpThemeRepository("/themes", fetcher).loadThemes();

    expect(result).toEqual({ themes: [], errors: [] });
    expect(calls).toEqual(["/themes/manifest.json"]);
  });

  it("copies sensitive metadata from the manifest into a loaded theme", async () => {
    const fetcher = createFetcher({
      "/themes/manifest.json": {
        schemaVersion: 1,
        themes: [
          { id: "valid", file: "valid.json", enabled: true, sensitive: true },
        ],
      },
      "/themes/valid.json": validTheme,
    });

    const result = await new HttpThemeRepository("/themes", fetcher).loadThemes();

    expect(result.themes[0]?.sensitive).toBe(true);
  });
});

function createFetcher(
  fixtures: Record<string, unknown>,
  calls: string[] = [],
): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    if (!(url in fixtures)) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(JSON.stringify(fixtures[url]), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
}
