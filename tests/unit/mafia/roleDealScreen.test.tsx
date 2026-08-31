/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RoleDealScreen } from "../../../src/games/mafia/features/role-deal/RoleDealScreen";
import type { LoverMode, MafiaRole } from "../../../src/games/mafia/domain/types";

let container: HTMLDivElement;
let root: Root;

const callbacks = {
  onReveal: vi.fn(),
  onHide: vi.fn(),
  onCancel: vi.fn(),
  onOpenSettings: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("RoleDealScreen", () => {
  it("keeps the secret absent and Next disabled until the card reveals it", () => {
    vi.useFakeTimers();
    renderRole(false);
    const next = buttonByText("Следующий игрок");

    expect(container.textContent).not.toContain("Дон");
    expect(container.textContent).not.toContain("Вы играете за мафию");
    expect(container.querySelector(".lucide-crown")).toBeNull();
    expect(next.disabled).toBe(true);

    act(() => buttonByText("Посмотрите свою роль").click());
    expect(callbacks.onReveal).toHaveBeenCalledOnce();
    renderRole(true);
    expect(next.disabled).toBe(true);

    act(() => vi.advanceTimersByTime(500));
    const status = container.querySelector<HTMLElement>('[role="status"]');
    expect(status?.textContent).toContain("Дон");
    expect(status?.textContent).toContain("Вы играете за мафию");
    expect(status?.querySelector(".lucide-crown")).not.toBeNull();
    expect(next.disabled).toBe(false);
    expect(document.activeElement).toBe(next);
  });

  it("removes the flip delay when reduced motion is requested", () => {
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    renderRole(false);
    const next = buttonByText("Следующий игрок");

    act(() => buttonByText("Посмотрите свою роль").click());
    renderRole(true);
    act(() => vi.advanceTimersByTime(0));

    expect(next.disabled).toBe(false);
  });

  it("explains the configured Lover ability on the private role card", () => {
    renderRole(true, "lover", "block-vote");

    const status = container.querySelector<HTMLElement>('[role="status"]');
    expect(status?.textContent).toContain("Любовница");
    expect(status?.textContent).toContain("не сможет голосовать");
  });
});

function renderRole(
  isRevealed: boolean,
  role: MafiaRole = "don",
  loverMode: LoverMode = "protect-and-link",
): void {
  act(() => root.render(
    <RoleDealScreen
      {...callbacks}
      playerName="Игрок 1"
      role={role}
      loverMode={loverMode}
      isRevealed={isRevealed}
      isLastPlayer={false}
    />,
  ));
}

function buttonByText(text: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll("button")).find(
    (candidate) => candidate.textContent?.includes(text),
  );
  if (!button) throw new Error(`Missing button: ${text}`);
  return button;
}
