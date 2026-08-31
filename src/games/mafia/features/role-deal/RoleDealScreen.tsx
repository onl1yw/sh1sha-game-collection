import { useEffect, useRef, useState } from "react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { GameExitAction } from "../../../../shared/ui/GameExitAction";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import type { LoverMode, MafiaRole } from "../../domain/types";
import { presentationForRole } from "../rolePresentation";
import { RoleRevealCard } from "../shared/RoleRevealCard";

export interface RoleDealScreenProps {
  playerName: string;
  role: MafiaRole;
  loverMode: LoverMode;
  isRevealed: boolean;
  isLastPlayer: boolean;
  onReveal: () => void;
  onHide: () => void;
  onCancel: () => void;
  onOpenSettings: () => void;
}

const FLIP_LOCK_MS = 460;

export function RoleDealScreen(props: RoleDealScreenProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<number | null>(null);
  const lockRef = useRef(false);
  const focusTargetRef = useRef<"card" | "next" | null>(null);
  const [locked, setLocked] = useState(false);
  const role = presentationForRole(props.role, props.loverMode);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (locked || focusTargetRef.current === null) return;
    const focusTarget = focusTargetRef.current;
    focusTargetRef.current = null;
    if (focusTarget === "card") cardRef.current?.focus();
    else nextRef.current?.focus();
  }, [locked, props.isRevealed]);

  const lock = (focus: "card" | "next"): boolean => {
    if (lockRef.current) return false;
    lockRef.current = true;
    focusTargetRef.current = focus;
    setLocked(true);
    timerRef.current = window.setTimeout(() => {
      lockRef.current = false;
      setLocked(false);
      timerRef.current = null;
    }, reducedMotion() ? 0 : FLIP_LOCK_MS);
    return true;
  };

  const reveal = () => {
    if (!props.isRevealed && lock("next")) props.onReveal();
  };
  const hide = () => {
    if (props.isRevealed && lock("card")) props.onHide();
  };

  return (
    <AppShell
      ariaLabel="Раздача ролей Мафии"
      actions={(
        <Button ref={nextRef} fullWidth disabled={!props.isRevealed || locked} onClick={hide}>
          {props.isLastPlayer ? "Начать игру" : "Следующий игрок"}
        </Button>
      )}
    >
      <ScreenHeader
        eyebrow="Раздача ролей"
        title={props.playerName}
        leadingAction={(
          <GameExitAction
            stage="deal"
            onConfirm={props.onCancel}
          />
        )}
        trailingAction={(
          <SettingsButton onClick={props.onOpenSettings} />
        )}
      />
      <RoleRevealCard
        ref={cardRef}
        revealed={props.isRevealed}
        disabled={locked}
        frontLabel="Нажмите на карточку"
        frontTitle="Посмотрите свою роль"
        backLabel="Ваша роль"
        backTitle={role.name}
        backDescription={role.description}
        backTone={role.tone}
        Icon={role.Icon}
        onReveal={reveal}
      />
    </AppShell>
  );
}

function reducedMotion(): boolean {
  return typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
