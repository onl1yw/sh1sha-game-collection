/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SettingsScreen } from "../../src/features/settings/SettingsScreen";

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

describe("SettingsScreen", () => {
  it("selects a color theme and toggles sensitive topics", () => {
    const onColorThemeChange = vi.fn();
    const onSensitiveThemesChange = vi.fn();
    act(() => root.render(
      <SettingsScreen
        colorTheme="dark"
        showSensitiveThemes={false}
        onBack={vi.fn()}
        onColorThemeChange={onColorThemeChange}
        onSensitiveThemesChange={onSensitiveThemesChange}
      />,
    ));

    const light = findButton("Светлая");
    const sensitive = findButtonByLabel("Показывать чувствительные темы");
    expect(findButton("Тёмная").getAttribute("aria-pressed")).toBe("true");
    expect(sensitive.getAttribute("aria-checked")).toBe("false");

    act(() => light.click());
    act(() => sensitive.click());

    expect(onColorThemeChange).toHaveBeenCalledWith("light");
    expect(onSensitiveThemesChange).toHaveBeenCalledWith(true);
  });
});

function findButton(text: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll("button")).find(
    (candidate) => candidate.textContent?.includes(text),
  );
  if (!button) throw new Error(`Missing button: ${text}`);
  return button;
}

function findButtonByLabel(label: string): HTMLButtonElement {
  const button = container.querySelector<HTMLButtonElement>(
    `button[aria-label="${label}"]`,
  );
  if (!button) throw new Error(`Missing button: ${label}`);
  return button;
}
