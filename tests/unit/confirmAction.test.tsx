/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConfirmAction } from "../../src/shared/ui/ConfirmAction";

let container: HTMLDivElement;
let root: Root;
let mounted: boolean;

beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  mounted = true;
  setWindowScroll(0, 0);
});

afterEach(() => {
  if (mounted) act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  setWindowScroll(0, 0);
});

describe("ConfirmAction", () => {
  it("contains focus, blocks the background, and restores context on cancel", () => {
    const onBackgroundKeyDown = vi.fn();
    act(() => root.render(
      <div onKeyDown={onBackgroundKeyDown}>
        <ConfirmAction
          triggerLabel="Прервать игру"
          prompt="Точно прервать?"
          confirmLabel="Прервать"
          onConfirm={vi.fn()}
        />
      </div>,
    ));
    const trigger = buttonByText("Прервать игру");
    trigger.focus();
    setWindowScroll(9, 180);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation((x, y) => {
      if (typeof x === "number" && typeof y === "number") {
        setWindowScroll(x, y);
      }
    });

    act(() => trigger.click());
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const confirm = buttonByText("Прервать");
    const cancel = buttonByText("Отмена");
    expect(dialog).not.toBeNull();
    expect(document.activeElement).toBe(cancel);
    expect(container.hasAttribute("inert")).toBe(true);
    expect(container.getAttribute("aria-hidden")).toBe("true");
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");

    pressTab(cancel);
    expect(document.activeElement).toBe(confirm);
    pressTab(confirm, true);
    expect(document.activeElement).toBe(cancel);
    expect(onBackgroundKeyDown).not.toHaveBeenCalled();

    setWindowScroll(0, 0);
    act(() => cancel.dispatchEvent(new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Escape",
    })));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(container.hasAttribute("inert")).toBe(false);
    expect(container.hasAttribute("aria-hidden")).toBe(false);
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");
    expect(scrollTo).toHaveBeenCalledWith(9, 180);
  });

  it("cleans up the page lock when unmounted while open", () => {
    act(() => root.render(
      <ConfirmAction
        triggerLabel="Сбросить"
        prompt="Точно сбросить?"
        confirmLabel="Сбросить"
        onConfirm={vi.fn()}
      />,
    ));
    act(() => buttonByText("Сбросить").click());
    expect(document.body.style.position).toBe("fixed");

    mounted = false;
    act(() => root.unmount());
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(container.hasAttribute("inert")).toBe(false);
    expect(container.hasAttribute("aria-hidden")).toBe(false);
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");
  });
});

function buttonByText(text: string): HTMLButtonElement {
  const button = Array.from(document.querySelectorAll("button")).find(
    (candidate) => candidate.textContent === text,
  );
  if (!button) throw new Error(`Missing button: ${text}`);
  return button;
}

function pressTab(target: HTMLElement, shiftKey = false): void {
  act(() => target.dispatchEvent(new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key: "Tab",
    shiftKey,
  })));
}

function setWindowScroll(x: number, y: number): void {
  Object.defineProperties(window, {
    scrollX: { configurable: true, value: x },
    scrollY: { configurable: true, value: y },
  });
}
