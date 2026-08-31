/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MafiaSetupScreen } from "../../../src/games/mafia/features/setup/MafiaSetupScreen";

let container: HTMLDivElement;
let root: Root;

const callbacks = {
  onPlayerCountChange: vi.fn(),
  onPlayerNameChange: vi.fn(),
  onOrdinaryMafiaCountChange: vi.fn(),
  onDonChange: vi.fn(),
  onCommissionerChange: vi.fn(),
  onDoctorChange: vi.fn(),
  onLoverChange: vi.fn(),
  onLoverModeChange: vi.fn(),
  onManiacChange: vi.fn(),
  onHostByLotChange: vi.fn(),
  onRevealRolesChange: vi.fn(),
  onBack: vi.fn(),
  onOpenSettings: vi.fn(),
  onStart: vi.fn(),
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
});

describe("MafiaSetupScreen", () => {
  it("exposes role and reveal settings while sound lives in collection settings", () => {
    renderSetup(9);

    const don = switchByLabel("Включить: Дон");
    const commissioner = switchByLabel("Выключить: Комиссар");
    const doctor = switchByLabel("Выключить: Доктор");
    const maniac = switchByLabel("Включить: Маньяк");
    const lover = switchByLabel("Включить: Любовница");
    const host = switchByLabel("Выбирать ведущего по жеребьёвке");
    const reveal = switchByLabel("Раскрывать роли выбывших игроков");

    expect([don, commissioner, doctor, lover, maniac, host, reveal].every(
      (control) => control.getAttribute("role") === "switch",
    )).toBe(true);
    expect(don.getAttribute("aria-checked")).toBe("false");
    expect(host.getAttribute("aria-checked")).toBe("false");
    expect(reveal.getAttribute("aria-checked")).toBe("true");

    act(() => don.click());
    act(() => lover.click());
    act(() => host.click());
    act(() => reveal.click());
    expect(callbacks.onDonChange).toHaveBeenCalledWith(true);
    expect(callbacks.onLoverChange).toHaveBeenCalledWith(true);
    expect(callbacks.onHostByLotChange).toHaveBeenCalledWith(true);
    expect(callbacks.onRevealRolesChange).toHaveBeenCalledWith(false);
  });

  it("shows the two Lover modes only while the role is enabled", () => {
    renderSetup(7, true);

    const modes = Array.from(
      container.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
    );
    expect(modes.map((mode) => mode.value)).toEqual([
      "protect-and-link",
      "block-vote",
    ]);
    act(() => modes[1]?.click());
    expect(callbacks.onLoverModeChange).toHaveBeenCalledWith("block-vote");
  });

  it("disables Maniac below nine players", () => {
    renderSetup(7);
    const maniac = switchByLabel("Включить: Маньяк");

    expect(maniac.disabled).toBe(true);
    expect(container.textContent).toContain("Доступен от 9 игроков");
    act(() => maniac.click());
    expect(callbacks.onManiacChange).not.toHaveBeenCalled();
  });
});

function renderSetup(playerCount: number, lover = false): void {
  const players = Array.from({ length: playerCount }, (_, index) => ({
    id: `player-${index + 1}`,
    name: `Игрок ${index + 1}`,
  }));
  act(() => root.render(
    <MafiaSetupScreen
      {...callbacks}
      players={players}
      minPlayers={5}
      maxPlayers={12}
      activePlayerCount={playerCount}
      canStart
      ordinaryMafiaCount={2}
      maxOrdinaryMafia={4}
      civilianCount={playerCount - 5}
      don={false}
      commissioner
      doctor
      lover={lover}
      loverMode="protect-and-link"
      maniac={false}
      hostByLot={false}
      revealRoles
    />,
  ));
}

function switchByLabel(label: string): HTMLButtonElement {
  const control = container.querySelector<HTMLButtonElement>(
    `button[role="switch"][aria-label="${label}"]`,
  );
  if (!control) throw new Error(`Missing switch: ${label}`);
  return control;
}
