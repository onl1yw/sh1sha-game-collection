/** @vitest-environment jsdom */

import { act } from "react";
import { HatGlasses } from "lucide-react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GameCollectionScreen } from "../../src/features/game-collection/GameCollectionScreen";

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
});

describe("GameCollectionScreen", () => {
  it("emphasizes the owner and uses the spy icon without a redundant heading", () => {
    act(() => root.render(
      <GameCollectionScreen
        games={[{
          id: "spy",
          title: "Шпион",
          description: "Найдите шпиона в компании",
          Icon: HatGlasses,
          iconTone: "danger",
          hasSavedSession: false,
        }]}
        onOpenSettings={vi.fn()}
        onOpenGame={vi.fn()}
      />,
    ));

    const heading = container.querySelector("h1");
    expect(heading?.querySelector("span")?.textContent).toBe("sh1sha's");
    expect(container.querySelector("h2")).toBeNull();
    const spyIcon = container.querySelector(".lucide-hat-glasses");
    expect(spyIcon).not.toBeNull();
    expect(spyIcon?.parentElement?.dataset.iconTone).toBe("danger");

    const repositoryLink = container.querySelector<HTMLAnchorElement>(
      'a[aria-label="Открыть GitHub проекта"]',
    );
    expect(repositoryLink?.href).toBe(
      "https://github.com/onl1yw/sh1sha-game-collection",
    );
    expect(repositoryLink?.target).toBe("_blank");
    expect(repositoryLink?.rel).toContain("noopener");
    expect(repositoryLink?.querySelector(".lucide-git-fork")).not.toBeNull();
  });
});
