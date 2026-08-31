import { Sunrise } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { GameExitAction } from "../../../../shared/ui/GameExitAction";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import type { MafiaRole } from "../../domain/types";
import { presentationForRole } from "../rolePresentation";
import { RoleRevealCard } from "../shared/RoleRevealCard";

export type RevealedPlayer =
  | { id: string; name: string; roleName?: undefined; role?: undefined }
  | { id: string; name: string; roleName: string; role: MafiaRole };

export interface DawnScreenProps {
  nightNumber: number;
  deaths: readonly RevealedPlayer[];
  onCancel: () => void;
  onOpenSettings: () => void;
  onContinue: () => void;
}

const FLIP_LOCK_MS = 460;

export function DawnScreen(props: DawnScreenProps) {
  const resultKey = props.deaths
    .map((player) => `${player.id}:${player.role ?? "hidden"}`)
    .join("|");
  return <DawnResult key={resultKey} {...props} />;
}

function DawnResult(props: DawnScreenProps) {
  const [deathIndex, setDeathIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<number | null>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const death = props.deaths[deathIndex] ?? null;
  const role = death?.role ? presentationForRole(death.role) : null;
  const needsReveal = role !== null;
  const hasNextDeath = deathIndex < props.deaths.length - 1;

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (needsReveal && revealed && !locked) nextRef.current?.focus();
  }, [locked, needsReveal, revealed]);

  useEffect(() => {
    if (deathIndex === 0) return;
    (needsReveal ? cardRef : nextRef).current?.focus();
  }, [deathIndex, needsReveal]);

  const reveal = () => {
    if (!needsReveal || revealed || locked) return;
    setRevealed(true);
    setLocked(true);
    timerRef.current = window.setTimeout(() => {
      setLocked(false);
      timerRef.current = null;
    }, reducedMotion() ? 0 : FLIP_LOCK_MS);
  };

  const continueDawn = () => {
    if (needsReveal && (!revealed || locked)) return;
    if (!hasNextDeath) {
      props.onContinue();
      return;
    }
    setDeathIndex((index) => index + 1);
    setRevealed(false);
    setLocked(false);
  };

  return (
    <AppShell
      ariaLabel={`Рассвет после ночи ${props.nightNumber}`}
      actions={(
        <Button
          ref={nextRef}
          fullWidth
          disabled={needsReveal && (!revealed || locked)}
          onClick={continueDawn}
        >
          {hasNextDeath ? "Следующий выбывший" : "Продолжить"}
        </Button>
      )}
    >
      <ScreenHeader
        eyebrow={eyebrow(props.nightNumber, deathIndex, props.deaths.length)}
        title="Наступает утро"
        leadingAction={<GameExitAction onConfirm={props.onCancel} />}
        trailingAction={(
          <SettingsButton onClick={props.onOpenSettings} />
        )}
      />
      <RoleRevealCard
        ref={cardRef}
        revealed={!needsReveal || revealed}
        disabled={locked}
        frontLabel={death?.name ?? "Рассвет"}
        frontTitle="Вскрыть роль"
        backLabel={role ? "Роль выбывшего" : death ? "Игру покидает" : "Этой ночью"}
        backTitle={role?.name ?? death?.name ?? "Никто не выбыл"}
        backDescription={role ? death?.name : undefined}
        backTone={role?.tone ?? (death ? "danger" : "accent")}
        Icon={role?.Icon ?? Sunrise}
        onReveal={reveal}
      />
    </AppShell>
  );
}

function eyebrow(nightNumber: number, deathIndex: number, deathCount: number): string {
  const base = `Ночь ${nightNumber} окончена`;
  return deathCount > 1 ? `${base} · ${deathIndex + 1} из ${deathCount}` : base;
}

function reducedMotion(): boolean {
  return typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
