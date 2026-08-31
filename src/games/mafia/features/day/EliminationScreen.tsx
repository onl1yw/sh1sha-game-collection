import { Gavel } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { GameExitAction } from "../../../../shared/ui/GameExitAction";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import type { MafiaRole } from "../../domain/types";
import { presentationForRole } from "../rolePresentation";
import { RoleRevealCard } from "../shared/RoleRevealCard";

type EliminatedPlayer =
  | { name: string; roleName?: undefined; role?: undefined }
  | { name: string; roleName: string; role: MafiaRole };

export interface EliminationScreenProps {
  dayNumber: number;
  player: EliminatedPlayer | null;
  nextLabel: string;
  onCancel: () => void;
  onOpenSettings: () => void;
  onContinue: () => void;
}

const FLIP_LOCK_MS = 460;

export function EliminationScreen(props: EliminationScreenProps) {
  const resultKey = `${props.player?.name ?? "none"}:${props.player?.roleName ?? "hidden"}`;
  return <EliminationResult key={resultKey} {...props} />;
}

function EliminationResult(props: EliminationScreenProps) {
  const needsReveal = Boolean(props.player?.roleName);
  const [revealed, setRevealed] = useState(!needsReveal);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<number | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const role = props.player?.role ? presentationForRole(props.player.role) : null;

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (needsReveal && revealed && !locked) nextRef.current?.focus();
  }, [locked, needsReveal, revealed]);

  const reveal = () => {
    if (!needsReveal || revealed || locked) return;
    setRevealed(true);
    setLocked(true);
    timerRef.current = window.setTimeout(() => {
      setLocked(false);
      timerRef.current = null;
    }, reducedMotion() ? 0 : FLIP_LOCK_MS);
  };

  return (
    <AppShell
      ariaLabel={`Итог голосования дня ${props.dayNumber}`}
      actions={(
        <Button
          ref={nextRef}
          fullWidth
          disabled={needsReveal && (!revealed || locked)}
          onClick={props.onContinue}
        >
          {props.nextLabel}
        </Button>
      )}
    >
      <ScreenHeader
        eyebrow={`День ${props.dayNumber}`}
        title="Решение города"
        leadingAction={<GameExitAction onConfirm={props.onCancel} />}
        trailingAction={(
          <SettingsButton onClick={props.onOpenSettings} />
        )}
      />
      <RoleRevealCard
        revealed={revealed}
        disabled={locked}
        frontLabel={props.player?.name ?? "Решение города"}
        frontTitle="Вскрыть роль"
        backLabel={role ? "Роль выбывшего" : props.player ? "Игру покидает" : "Решение города"}
        backTitle={role?.name ?? props.player?.name ?? "Никто не выбыл"}
        backDescription={role ? props.player?.name : undefined}
        backTone={role?.tone ?? (props.player ? "danger" : "accent")}
        Icon={role?.Icon ?? Gavel}
        onReveal={reveal}
      />
    </AppShell>
  );
}

function reducedMotion(): boolean {
  return typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
