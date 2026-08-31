/** @vitest-environment jsdom */

import { UserRound } from "lucide-react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NightActionScreen } from "../../../src/games/mafia/features/night/NightActionScreen";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

describe("NightActionScreen", () => {
  it("never skips an available living role", () => {
    const onWindowEnd = vi.fn();
    renderAction({ onWindowEnd });

    expect(container.querySelector("h1")?.textContent).toBe("Ночной ход");
    expect(buttonByLabel("Настройки")).not.toBeNull();
    expect(container.querySelector("footer")).not.toBeNull();
    act(() => vi.advanceTimersByTime(60000));
    expect(onWindowEnd).not.toHaveBeenCalled();
  });

  it("advances a hidden dummy role after its neutral wait", () => {
    const onWindowEnd = vi.fn();
    renderAction({
      actionAvailable: false,
      autoContinueAfterMs: 15000,
      onWindowEnd,
    });

    const confirm = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Подтвердить"),
    );
    expect(confirm?.disabled).toBe(true);
    expect(buttonByLabel("Настройки")).toBeNull();
    act(() => vi.advanceTimersByTime(15000));
    expect(onWindowEnd).toHaveBeenCalledOnce();
  });

  it("explains and advances a living role with no legal targets", () => {
    const onWindowEnd = vi.fn();
    renderAction({
      targets: [],
      selectedId: null,
      autoContinueAfterMs: 3000,
      emptyStateMessage: "Нет доступных целей. Переходим к следующей роли.",
      onWindowEnd,
    });

    expect(container.querySelector('[role="status"]')?.textContent)
      .toContain("Нет доступных целей");
    act(() => vi.advanceTimersByTime(2999));
    expect(onWindowEnd).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onWindowEnd).toHaveBeenCalledOnce();
  });

  it("pauses an automatic night step while narration is inaudible", () => {
    const onWindowEnd = vi.fn();
    const overrides = {
      autoContinueAfterMs: 3000,
      onWindowEnd,
    };
    renderAction({ ...overrides, paused: true });

    expect(container.querySelector('[role="status"]')?.textContent)
      .toContain("Ночь приостановлена");
    expect(buttonByLabel("Настройки")).not.toBeNull();
    expect(buttonByText("Подтвердить").disabled).toBe(true);
    act(() => vi.advanceTimersByTime(10000));
    expect(onWindowEnd).not.toHaveBeenCalled();

    renderAction({ ...overrides, paused: false });
    act(() => vi.advanceTimersByTime(3000));
    expect(onWindowEnd).toHaveBeenCalledOnce();
  });
});

interface ActionOverrides {
  actionAvailable?: boolean;
  autoContinueAfterMs?: number;
  emptyStateMessage?: string;
  feedback?: { label: string; title: string; danger: boolean };
  onWindowEnd: () => void;
  paused?: boolean;
  selectedId?: string | null;
  targets?: readonly { id: string; name: string }[];
}

function buttonByLabel(label: string): HTMLButtonElement | null {
  return container.querySelector<HTMLButtonElement>(
    `button[aria-label="${label}"]`,
  );
}

function buttonByText(text: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll("button")).find(
    (candidate) => candidate.textContent?.includes(text),
  );
  if (!button) throw new Error(`Missing button: ${text}`);
  return button;
}

function renderAction(overrides: ActionOverrides): void {
  act(() => root.render(
    <NightActionScreen
      nightNumber={1}
      roleName="Доктор"
      instruction="Выберите игрока"
      Icon={UserRound}
      tone="accent"
      targets={overrides.targets ?? [{ id: "player-1", name: "Игрок 1" }]}
      selectedId={overrides.selectedId === undefined ? "player-1" : overrides.selectedId}
      actionAvailable={overrides.actionAvailable ?? !overrides.feedback}
      paused={overrides.paused ?? false}
      {...(overrides.autoContinueAfterMs !== undefined
        ? { autoContinueAfterMs: overrides.autoContinueAfterMs }
        : {})}
      {...(overrides.feedback ? { feedback: overrides.feedback } : {})}
      {...(overrides.emptyStateMessage
        ? { emptyStateMessage: overrides.emptyStateMessage }
        : {})}
      onSelect={vi.fn()}
      onConfirm={vi.fn()}
      onWindowEnd={overrides.onWindowEnd}
      onCancel={vi.fn()}
      onOpenSettings={vi.fn()}
    />,
  ));
}
