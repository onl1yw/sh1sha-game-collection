/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Narrator } from "../../../src/games/mafia/app/ports/narrator";
import { MafiaGameProvider } from "../../../src/games/mafia/app/state/MafiaGameProvider";
import { useMafiaGame } from "../../../src/games/mafia/app/state/useMafiaGame";

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

describe("MafiaGameProvider narration", () => {
  it("exposes injected narrator availability through game context", () => {
    const narrator = fakeNarrator(false);
    act(() => root.render(
      <MafiaGameProvider narrator={narrator} soundEnabled soundVolume={0.6}>
        <AvailabilityProbe />
      </MafiaGameProvider>,
    ));

    expect(container.textContent).toBe("unavailable:inaudible");
    expect(narrator.speak).not.toHaveBeenCalled();
    expect(narrator.cancel).toHaveBeenCalled();
  });

  it("does not cancel merely because the current phase has no narration", () => {
    const narrator = fakeNarrator(true);
    act(() => root.render(
      <MafiaGameProvider narrator={narrator} soundEnabled soundVolume={0.6}>
        <AvailabilityProbe />
      </MafiaGameProvider>,
    ));

    expect(container.textContent).toBe("available:audible");
    expect(narrator.speak).not.toHaveBeenCalled();
    expect(narrator.cancel).not.toHaveBeenCalled();
  });

  it("treats zero volume as muted and cancels narration", () => {
    const narrator = fakeNarrator(true);
    act(() => root.render(
      <MafiaGameProvider narrator={narrator} soundEnabled soundVolume={0}>
        <AvailabilityProbe />
      </MafiaGameProvider>,
    ));

    expect(container.textContent).toBe("available:inaudible");
    expect(narrator.speak).not.toHaveBeenCalled();
    expect(narrator.cancel).toHaveBeenCalledOnce();
  });

  it("becomes inaudible and cancels when sound is muted mid-game", () => {
    const narrator = fakeNarrator(true);
    renderProvider(narrator, true);
    expect(container.textContent).toBe("available:audible");

    renderProvider(narrator, false);
    expect(container.textContent).toBe("available:inaudible");
    expect(narrator.cancel).toHaveBeenCalledOnce();
  });
});

function AvailabilityProbe() {
  const { narrationAvailable, narrationAudible } = useMafiaGame();
  return (
    <span>
      {narrationAvailable ? "available" : "unavailable"}
      :
      {narrationAudible ? "audible" : "inaudible"}
    </span>
  );
}

function renderProvider(narrator: Narrator, soundEnabled: boolean): void {
  act(() => root.render(
    <MafiaGameProvider
      narrator={narrator}
      soundEnabled={soundEnabled}
      soundVolume={0.6}
    >
      <AvailabilityProbe />
    </MafiaGameProvider>,
  ));
}

function fakeNarrator(available: boolean) {
  return {
    available,
    speak: vi.fn(),
    cancel: vi.fn(),
  } satisfies Narrator;
}
