/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RoleRevealScreen } from "../../src/games/spy/features/role-reveal/RoleRevealScreen";

const commonProps = {
  playerName: "Игрок 1",
  themeName: "Места",
  onReveal: vi.fn(),
  onHide: vi.fn(),
  onCancel: vi.fn(),
  onOpenSettings: vi.fn(),
};

let container: HTMLDivElement;
let root: Root;

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

describe("RoleRevealScreen", () => {
  it("keeps one card and Next action while adding and removing the secret", () => {
    renderHidden();
    const flipper = getTestElement("role-card-flipper");
    const action = getTestElement("role-primary-action") as HTMLButtonElement;

    expect(container.textContent).toContain("Посмотрите свою роль");
    expect(container.textContent).toContain("Места");
    expect(container.textContent).not.toContain("Игрок 1 из 3");
    expect(container.textContent).not.toContain("Передайте телефон");
    expect(container.textContent).not.toContain("Секретное место");
    expect(container.innerHTML).not.toContain("Секретное место");
    expect(action.textContent).toBe("Следующий игрок");
    expect(action.disabled).toBe(true);

    act(() => root.render(
      <RoleRevealScreen
        {...commonProps}
        isRevealed
        role={{ kind: "word", word: "Секретное место" }}
      />,
    ));

    expect(getTestElement("role-card-flipper")).toBe(flipper);
    expect(getTestElement("role-primary-action")).toBe(action);
    expect(container.textContent).toContain("Секретное место");
    expect(flipper.dataset.revealed).toBe("true");
    expect(action.disabled).toBe(false);

    renderHidden();
    expect(getTestElement("role-card-flipper")).toBe(flipper);
    expect(container.textContent).not.toContain("Секретное место");
    expect(container.innerHTML).not.toContain("Секретное место");
    expect(action.disabled).toBe(true);
  });

  it("reveals only from the card and enables Next after the flip", () => {
    vi.useFakeTimers();
    renderHidden();
    const card = getTestElement("role-card-action") as HTMLButtonElement;
    const action = getTestElement("role-primary-action") as HTMLButtonElement;

    act(() => card.click());
    act(() => card.click());

    expect(commonProps.onReveal).toHaveBeenCalledTimes(1);
    expect(action.disabled).toBe(true);

    act(() => root.render(
      <RoleRevealScreen
        {...commonProps}
        isRevealed
        role={{ kind: "word", word: "Секретное место" }}
      />,
    ));
    expect(action.disabled).toBe(true);

    act(() => vi.advanceTimersByTime(500));
    expect(action.disabled).toBe(false);
    expect(document.activeElement).toBe(action);

    act(() => action.click());
    act(() => action.click());
    expect(commonProps.onHide).toHaveBeenCalledTimes(1);
  });

  it("moves the cancel action into the screen header", () => {
    renderHidden();
    const cancel = findButton("Прервать раздачу");

    act(() => cancel.click());

    expect(cancel.closest("header")).not.toBeNull();
    expect(cancel.querySelector("svg")).not.toBeNull();
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    expect(commonProps.onCancel).not.toHaveBeenCalled();

    act(() => findButton("Да, прервать раздачу").click());
    expect(commonProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("shows a dedicated icon only for an explicit spy role", () => {
    act(() => root.render(
      <RoleRevealScreen
        {...commonProps}
        isRevealed
        role={{ kind: "spy" }}
      />,
    ));

    expect(getTestElement("spy-role-icon").classList).toContain(
      "lucide-hat-glasses",
    );

    act(() => root.render(
      <RoleRevealScreen
        {...commonProps}
        isRevealed
        role={{ kind: "word", word: "Аэропорт" }}
      />,
    ));

    expect(container.querySelector('[data-testid="spy-role-icon"]')).toBeNull();
  });

  it("does not delay Next when reduced motion is enabled", () => {
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    renderHidden();
    const card = getTestElement("role-card-action") as HTMLButtonElement;
    const action = getTestElement("role-primary-action") as HTMLButtonElement;

    act(() => card.click());
    act(() => root.render(
      <RoleRevealScreen
        {...commonProps}
        isRevealed
        role={{ kind: "spy" }}
      />,
    ));
    act(() => vi.advanceTimersByTime(0));

    expect(action.disabled).toBe(false);
  });

  it("marks long Russian words for compact rendering", () => {
    act(() => root.render(
      <RoleRevealScreen
        {...commonProps}
        isRevealed
        role={{ kind: "word", word: "Достопримечательность" }}
      />,
    ));
    const word = Array.from(container.querySelectorAll("span")).find(
      (element) => element.textContent === "Достопримечательность",
    );

    expect(word?.className).toMatch(/wordDense/);
    expect(word?.lang).toBe("ru");
  });
});

function renderHidden(): void {
  act(() => root.render(
    <RoleRevealScreen {...commonProps} isRevealed={false} />,
  ));
}

function getTestElement(testId: string): HTMLElement {
  const element = container.querySelector<HTMLElement>(
    `[data-testid="${testId}"]`,
  );
  if (!element) throw new Error(`Missing test element: ${testId}`);
  return element;
}

function findButton(label: string): HTMLButtonElement {
  const button = Array.from(document.querySelectorAll("button")).find(
    (candidate) => candidate.textContent?.includes(label),
  );
  if (!button) throw new Error(`Missing button: ${label}`);
  return button;
}
