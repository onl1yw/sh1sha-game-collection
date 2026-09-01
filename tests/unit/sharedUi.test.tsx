/** @vitest-environment jsdom */

import { HatGlasses } from "lucide-react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ActionBar } from "../../src/shared/ui/ActionBar";
import { AppBar } from "../../src/shared/ui/AppBar";
import { InteractiveCard } from "../../src/shared/ui/InteractiveCard";
import { ChoiceGroup } from "../../src/shared/ui/ChoiceGroup";
import { NumberStepper } from "../../src/shared/ui/NumberStepper";
import { NumberField } from "../../src/shared/ui/NumberField";
import { RangeField } from "../../src/shared/ui/RangeField";
import { ScreenHeader } from "../../src/shared/ui/ScreenHeader";
import { SettingsButton } from "../../src/shared/ui/SettingsButton";
import { Switch } from "../../src/shared/ui/Switch";

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

describe("shared UI controls", () => {
  it("renders an accessible interactive card", () => {
    const onClick = vi.fn();
    act(() => root.render(
      <InteractiveCard
        Icon={HatGlasses}
        title="Шпион"
        description="Описание"
        onClick={onClick}
      />,
    ));

    const card = container.querySelector("button");
    expect(card?.textContent).toContain("Шпион");
    expect(card?.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    act(() => card?.click());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a large square tile without changing the default row", () => {
    act(() => root.render(
      <InteractiveCard
        Icon={HatGlasses}
        layout="tile"
        title="Шпион"
      />,
    ));

    const card = container.querySelector("button");
    expect(card?.dataset.layout).toBe("tile");
    expect(card?.querySelector("svg")?.getAttribute("width")).toBe("64");
  });

  it("reports the next boolean value from a switch", () => {
    const onCheckedChange = vi.fn();
    act(() => root.render(
      <Switch
        checked={false}
        label="Показывать темы"
        onCheckedChange={onCheckedChange}
      />,
    ));

    const control = container.querySelector<HTMLButtonElement>("[role=switch]");
    expect(control?.getAttribute("aria-checked")).toBe("false");
    act(() => control?.click());
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("steps within explicit number bounds", () => {
    const onChange = vi.fn();
    act(() => root.render(
      <NumberStepper
        label="Игроков"
        hint="От 5 до 12"
        value={5}
        min={5}
        max={12}
        onChange={onChange}
      />,
    ));

    const decrease = findButton("Уменьшить: Игроков");
    const increase = findButton("Увеличить: Игроков");
    expect(decrease.disabled).toBe(true);
    expect(container.textContent).toContain("От 5 до 12");

    act(() => increase.click());
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it("accepts a direct number and clamps it on commit", () => {
    const onChange = vi.fn();
    act(() => root.render(
      <NumberField
        label="Очков для победы"
        value={30}
        min={5}
        max={100}
        selected
        suffix="сек"
        onChange={onChange}
      />,
    ));

    const input = container.querySelector<HTMLInputElement>('input[type="number"]');
    act(() => {
      if (!input) throw new Error("Missing number input");
      input.focus();
      setNativeValue(input, "140");
      input.blur();
    });
    expect(onChange).toHaveBeenCalledWith(100);
    expect(input?.value).toBe("100");
    expect(input?.closest("label")?.dataset.selected).toBe("true");
    expect(container.textContent).toContain("сек");
  });

  it("reports an accessible single choice", () => {
    const onChange = vi.fn();
    act(() => root.render(
      <ChoiceGroup
        legend="Способность"
        value="first"
        options={[
          { value: "first", title: "Первый" },
          { value: "second", title: "Второй", description: "Описание" },
        ]}
        onChange={onChange}
      />,
    ));

    const radios = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    expect(container.querySelector("legend")?.textContent).toBe("Способность");
    expect(radios[0]?.checked).toBe(true);
    act(() => radios[1]?.click());
    expect(onChange).toHaveBeenCalledWith("second");
  });

  it("reports a numeric range value", () => {
    const onValueChange = vi.fn();
    act(() => root.render(
      <RangeField
        id="volume"
        label="Громкость"
        min={0}
        max={100}
        step={5}
        value={60}
        valueText="60%"
        onValueChange={onValueChange}
      />,
    ));

    const input = container.querySelector<HTMLInputElement>('#volume');
    expect(input?.getAttribute("aria-valuetext")).toBe("60%");
    act(() => {
      if (!input) throw new Error("Missing range input");
      setNativeValue(input, "45");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(onValueChange).toHaveBeenCalledWith(45);
  });

  it("provides a reusable settings action", () => {
    const onClick = vi.fn();
    act(() => root.render(<SettingsButton onClick={onClick} />));

    const button = findButton("Настройки");
    expect(button.querySelector(".lucide-settings")).not.toBeNull();
    act(() => button.click());
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("wraps top and bottom chrome in shared bar components", () => {
    act(() => root.render(
      <>
        <ScreenHeader title="Заголовок" />
        <ActionBar><button>Продолжить</button></ActionBar>
      </>,
    ));

    const appBar = container.querySelector('[data-ui="app-bar"]');
    const actionBar = container.querySelector('[data-ui="action-bar"]');
    expect(appBar?.querySelector("header")?.textContent).toBe("Заголовок");
    expect(actionBar?.tagName).toBe("FOOTER");
    expect(actionBar?.querySelector("button")?.textContent).toBe("Продолжить");
  });

  it("keeps direct AppBar composition available for custom headers", () => {
    act(() => root.render(
      <AppBar><header>Бренд</header></AppBar>,
    ));

    expect(container.querySelector('[data-ui="app-bar"] header')?.textContent)
      .toBe("Бренд");
  });
});

function findButton(label: string): HTMLButtonElement {
  const button = container.querySelector<HTMLButtonElement>(
    `button[aria-label="${label}"]`,
  );
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
