import {
  Axe,
  Cigarette,
  Crown,
  Fingerprint,
  HeartHandshake,
  MicVocal,
  Stethoscope,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import type { LoverMode, MafiaRole, NightStepKind } from "../domain/types";

export interface RolePresentation {
  name: string;
  description: string;
  Icon: LucideIcon;
  tone: "accent" | "danger" | "neutral";
}

const ROLES: Readonly<Record<MafiaRole, RolePresentation>> = {
  civilian: {
    name: "Мирный житель",
    description: "Найдите мафию днём и не дайте ей захватить город",
    Icon: UserRound,
    tone: "accent",
  },
  mafia: {
    name: "Мафия",
    description: "Устраняйте мирных ночью и оставайтесь незамеченными",
    Icon: Cigarette,
    tone: "danger",
  },
  don: {
    name: "Дон",
    description: "Вы играете за мафию и ночью ищете комиссара",
    Icon: Crown,
    tone: "danger",
  },
  commissioner: {
    name: "Комиссар",
    description: "Каждую ночь проверяйте одного игрока",
    Icon: Fingerprint,
    tone: "accent",
  },
  doctor: {
    name: "Доктор",
    description: "Каждую ночь защищайте одного игрока",
    Icon: Stethoscope,
    tone: "accent",
  },
  lover: {
    name: "Любовница",
    description: "Каждую ночь выбирайте другого игрока и меняйте его судьбу",
    Icon: HeartHandshake,
    tone: "accent",
  },
  maniac: {
    name: "Маньяк",
    description: "Играйте в одиночку и останьтесь последним в живых",
    Icon: Axe,
    tone: "danger",
  },
  host: {
    name: "Ведущий",
    description: "Берите телефон ночью, вызывайте роли и не голосуйте",
    Icon: MicVocal,
    tone: "neutral",
  },
};

export function presentationForRole(
  role: MafiaRole,
  loverMode: LoverMode = "protect-and-link",
): RolePresentation {
  if (role !== "lover") return ROLES[role];
  return {
    ...ROLES.lover,
    description: loverMode === "protect-and-link"
      ? "Защитите выбранного игрока. Если ночью погибнете вы, погибнет и он"
      : "Выбранный игрок не сможет голосовать на следующий день",
  };
}

export function iconForNightStep(kind: NightStepKind): LucideIcon {
  if (kind === "lover-visit") return HeartHandshake;
  if (kind === "mafia-kill") return Cigarette;
  if (kind === "don-check") return Crown;
  if (kind === "commissioner-check") return Fingerprint;
  if (kind === "doctor-protect") return Stethoscope;
  return Axe;
}
