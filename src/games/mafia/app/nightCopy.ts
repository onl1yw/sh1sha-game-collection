import type { LoverMode, NightStepKind } from "../domain/types";

export interface NightStepCopy {
  roleName: string;
  instruction: string;
  tone: "accent" | "danger";
}

export const NIGHT_STEP_COPY: Readonly<Record<NightStepKind, NightStepCopy>> = {
  "lover-visit": {
    roleName: "Любовница",
    instruction: "Выберите другого игрока. Прошлая цель недоступна",
    tone: "accent",
  },
  "mafia-kill": {
    roleName: "Мафия",
    instruction: "Выберите игрока, который не проснётся утром",
    tone: "danger",
  },
  "don-check": {
    roleName: "Дон",
    instruction: "Проверьте, является ли игрок комиссаром",
    tone: "danger",
  },
  "commissioner-check": {
    roleName: "Комиссар",
    instruction: "Проверьте, играет ли человек за мафию",
    tone: "accent",
  },
  "doctor-protect": {
    roleName: "Доктор",
    instruction: "Выберите игрока, которого хотите спасти",
    tone: "accent",
  },
  "maniac-kill": {
    roleName: "Маньяк",
    instruction: "Выберите свою жертву",
    tone: "danger",
  },
};

export function instructionForNightStep(
  kind: NightStepKind,
  loverMode: LoverMode,
): string {
  if (kind !== "lover-visit") return NIGHT_STEP_COPY[kind].instruction;
  return loverMode === "protect-and-link"
    ? "Выберите другого игрока для защиты. Прошлая цель недоступна"
    : "Выберите, кто не будет голосовать днём. Прошлая цель недоступна";
}
