/** @vitest-environment jsdom */

import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { gameModule } from "../../../src/games/hat/gameModule";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("Hat game module", () => {
  it("exposes metadata and a lazy-loadable root screen", async () => {
    expect(gameModule.id).toBe("hat");
    expect(gameModule.title).toBe("Шляпа");
    expect(gameModule.requiresSensitiveContent).toBe(true);

    const { default: Game } = await gameModule.load();
    const onExit = vi.fn();
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      return new Response(JSON.stringify(url.endsWith("manifest.json")
        ? {
            schemaVersion: 1,
            themes: [{ id: "cinema", file: "cinema.json", enabled: true }],
          }
        : {
            schemaVersion: 1,
            id: "cinema",
            name: "Кино",
            description: "Фильмы",
            words: Array.from({ length: 40 }, (_, index) => `Слово ${index}`),
          }), { status: 200, headers: { "Content-Type": "application/json" } });
    }));

    await act(async () => root.render(
      <Game
        paused={false}
        storage={null}
        preferences={{
          showSensitiveContent: false,
          soundEnabled: true,
          soundVolume: 70,
        }}
        onExit={onExit}
        onOpenSettings={vi.fn()}
      />,
    ));
    await act(async () => Promise.resolve());

    expect(container.querySelector("h1")?.textContent).toBe("Шляпа");
    const backButton = Array.from(container.querySelectorAll("button"))
      .find((button) => button.textContent?.includes("Назад"));
    act(() => backButton?.click());
    expect(onExit).toHaveBeenCalledOnce();
  });

  it("ignores a catalog result after its Strict Mode load is aborted", async () => {
    const { default: Game } = await gameModule.load();
    let manifestRequest = 0;
    let resolveCurrentManifest: ((response: Response) => void) | undefined;
    vi.stubGlobal("fetch", vi.fn((input: string | URL | Request, init?: RequestInit) => {
      if (!String(input).endsWith("manifest.json")) {
        return Promise.resolve(jsonResponse({
          schemaVersion: 1,
          id: "cinema",
          name: "Кино",
          description: "Фильмы",
          words: Array.from({ length: 40 }, (_, index) => `Слово ${index}`),
        }));
      }
      manifestRequest += 1;
      if (manifestRequest === 1) {
        return new Promise<Response>((_resolve, reject) => {
          const abort = () => reject(new DOMException("Aborted", "AbortError"));
          if (init?.signal?.aborted) abort();
          else init?.signal?.addEventListener("abort", abort, { once: true });
        });
      }
      return new Promise<Response>((resolve) => {
        resolveCurrentManifest = resolve;
      });
    }));

    await act(async () => root.render(
      <StrictMode>
        <Game
          paused={false}
          storage={null}
          preferences={{
            showSensitiveContent: false,
            soundEnabled: true,
            soundVolume: 70,
          }}
          onExit={vi.fn()}
          onOpenSettings={vi.fn()}
        />
      </StrictMode>,
    ));
    await act(async () => Promise.resolve());

    expect(container.querySelector('main[aria-label="Загрузка Шляпы"]')).not.toBeNull();
    const resolveManifest = resolveCurrentManifest;
    if (!resolveManifest) throw new Error("Current catalog load did not start");
    await act(async () => {
      resolveManifest(jsonResponse({
        schemaVersion: 1,
        themes: [{ id: "cinema", file: "cinema.json", enabled: true }],
      }));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(container.querySelector("h1")?.textContent).toBe("Шляпа");
    expect(container.querySelector('main[aria-label="Ошибка Шляпы"]')).toBeNull();
  });
});

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
