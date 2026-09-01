/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PresetNumberField } from "../../src/shared/ui/PresetNumberField";
import { TeamNamesFieldset } from "../../src/shared/ui/TeamNamesFieldset";

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

describe("shared game setup controls", () => {
  it("offers accessible number presets and a custom value", () => {
    const onChange = vi.fn();
    act(() => root.render(
      <PresetNumberField
        label="Время раунда"
        value={30}
        presets={[
          { value: 15, label: "15 сек" },
          { value: 30, label: "30 сек" },
          { value: 60, label: "60 сек" },
        ]}
        min={10}
        max={180}
        customLabel="Своё время раунда"
        customPlaceholder="XX"
        suffix="сек"
        onChange={onChange}
      />,
    ));

    expect(container.querySelector("legend")?.textContent).toBe("Время раунда");
    const selected = findButton("30 сек");
    expect(selected.getAttribute("aria-pressed")).toBe("true");
    expect(container.querySelector<HTMLInputElement>('input[type="number"]')?.value)
      .toBe("");

    act(() => findButton("60 сек").click());
    expect(onChange).toHaveBeenCalledWith(60);
  });

  it("shows and commits an active custom number", () => {
    const onChange = vi.fn();
    act(() => root.render(
      <PresetNumberField
        label="Количество слов"
        value={47}
        presets={[
          { value: 10, label: "10 слов" },
          { value: 30, label: "30 слов" },
          { value: 50, label: "50 слов" },
        ]}
        min={5}
        max={100}
        customLabel="Своё количество слов"
        suffix="слов"
        onChange={onChange}
      />,
    ));

    const input = container.querySelector<HTMLInputElement>('input[type="number"]');
    expect(input?.value).toBe("47");
    expect(input?.closest("label")?.dataset.selected).toBe("true");

    act(() => {
      if (!input) throw new Error("Missing number input");
      input.focus();
      setNativeValue(input, "140");
      input.blur();
    });
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it("disables presets outside the current numeric range", () => {
    const onChange = vi.fn();
    act(() => root.render(
      <PresetNumberField
        label="Количество слов"
        value={30}
        presets={[
          { value: 10, label: "10 слов" },
          { value: 30, label: "30 слов" },
          { value: 50, label: "50 слов" },
        ]}
        min={5}
        max={30}
        customLabel="Своё количество слов"
        onChange={onChange}
      />,
    ));

    const unavailable = findButton("50 слов");
    expect(unavailable.disabled).toBe(true);
    act(() => unavailable.click());
    expect(onChange).not.toHaveBeenCalled();
  });

  it("edits team names with default and configurable Russian labels", () => {
    const onRename = vi.fn();
    act(() => root.render(
      <TeamNamesFieldset
        teams={[
          { id: "alpha", name: "Альфа" },
          { id: "beta", name: "Бета" },
        ]}
        legend="Назовите команды"
        labelForIndex={(index) => `Игровая команда ${index + 1}`}
        onRename={onRename}
      />,
    ));

    expect(container.querySelector("legend")?.textContent).toBe("Назовите команды");
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="text"]');
    expect(inputs[0]?.labels?.[0]?.textContent).toContain("Игровая команда 1");
    expect(inputs[1]?.placeholder).toBe("Команда 2");

    act(() => {
      const input = inputs[1];
      if (!input) throw new Error("Missing team input");
      setNativeValue(input, "Гамма");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(onRename).toHaveBeenCalledWith("beta", "Гамма");
  });
});

function findButton(label: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll("button"))
    .find((candidate) => candidate.textContent === label);
  if (!button) throw new Error(`Missing button: ${label}`);
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
