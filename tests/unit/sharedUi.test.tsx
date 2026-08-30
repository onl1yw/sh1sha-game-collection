/** @vitest-environment jsdom */

import { HatGlasses } from "lucide-react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InteractiveCard } from "../../src/shared/ui/InteractiveCard";
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
});
