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
  it("updates sound, color theme, and sensitive topics", () => {
    const onColorThemeChange = vi.fn();
    const onSensitiveThemesChange = vi.fn();
    const onSoundEnabledChange = vi.fn();
    const onSoundVolumeChange = vi.fn();
    act(() => root.render(
      <SettingsScreen
        colorTheme="dark"
        showSensitiveThemes={false}
        soundEnabled
        soundVolume={80}
        onBack={vi.fn()}
        onColorThemeChange={onColorThemeChange}
        onSensitiveThemesChange={onSensitiveThemesChange}
        onSoundEnabledChange={onSoundEnabledChange}
        onSoundVolumeChange={onSoundVolumeChange}
      />,
    ));

    const light = findButton("Светлая");
    const sensitive = findButtonByLabel("Показывать чувствительные темы");
    const sound = findButtonByLabel("Включить озвучку");
    const volume = container.querySelector<HTMLInputElement>('#sound-volume');
    expect(findButton("Тёмная").getAttribute("aria-pressed")).toBe("true");
    expect(sensitive.getAttribute("aria-checked")).toBe("false");
    expect(sound.getAttribute("aria-checked")).toBe("true");
    expect(volume?.value).toBe("80");

    act(() => light.click());
    act(() => sensitive.click());
    act(() => sound.click());
    act(() => {
      if (!volume) throw new Error("Missing volume control");
      setNativeValue(volume, "35");
      volume.dispatchEvent(new Event("input", { bubbles: true }));
    });

    expect(onColorThemeChange).toHaveBeenCalledWith("light");
    expect(onSensitiveThemesChange).toHaveBeenCalledWith(true);
    expect(onSoundEnabledChange).toHaveBeenCalledWith(false);
    expect(onSoundVolumeChange).toHaveBeenCalledWith(35);
  });
});

function findButton(text: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll("button")).find(
    (candidate) => candidate.textContent?.includes(text),
  );
  if (!button) throw new Error(`Missing button: ${text}`);
  return button;
}

function setNativeValue(input: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  if (!setter) throw new Error("Missing native input setter");
  setter.call(input, value);
}

function findButtonByLabel(label: string): HTMLButtonElement {
  const button = container.querySelector<HTMLButtonElement>(
    `button[aria-label="${label}"]`,
  );
  if (!button) throw new Error(`Missing button: ${label}`);
  return button;
}
