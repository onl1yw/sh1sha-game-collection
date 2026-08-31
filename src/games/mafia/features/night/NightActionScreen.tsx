import type { LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { GameExitAction } from "../../../../shared/ui/GameExitAction";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import { TargetGrid, type TargetOption } from "./TargetGrid";
import styles from "./NightActionScreen.module.css";

export interface NightActionScreenProps {
  nightNumber: number;
  roleName: string;
  instruction: string;
  Icon: LucideIcon;
  tone: "accent" | "danger";
  targets: readonly TargetOption[];
  selectedId: string | null;
  actionAvailable: boolean;
  paused: boolean;
  feedback?: { label: string; title: string; danger: boolean };
  emptyStateMessage?: string;
  autoContinueAfterMs?: number;
  onSelect: (playerId: string) => void;
  onConfirm: () => void;
  onWindowEnd: () => void;
  onCancel: () => void;
  onOpenSettings: () => void;
}

export function NightActionScreen(props: NightActionScreenProps) {
  const onWindowEndRef = useRef(props.onWindowEnd);

  useEffect(() => {
    onWindowEndRef.current = props.onWindowEnd;
  }, [props.onWindowEnd]);

  useEffect(() => {
    if (props.autoContinueAfterMs === undefined || props.paused) return;
    const timer = window.setTimeout(
      () => onWindowEndRef.current(),
      props.autoContinueAfterMs,
    );
    return () => window.clearTimeout(timer);
  }, [props.autoContinueAfterMs, props.paused]);

  const actionLabel = props.feedback ? "Скрыть результат" : "Подтвердить";
  const canConfirm = !props.paused && (
    Boolean(props.feedback)
    || (props.actionAvailable && props.selectedId !== null)
  );
  return (
    <AppShell
      ariaLabel={`${props.roleName}: ночное действие`}
      actions={(
        <Button fullWidth disabled={!canConfirm} onClick={props.onConfirm}>
          {actionLabel}
        </Button>
      )}
    >
      <ScreenHeader
        eyebrow={`Ночь ${props.nightNumber}`}
        title="Ночной ход"
        leadingAction={<GameExitAction onConfirm={props.onCancel} />}
        {...(props.autoContinueAfterMs === undefined || props.paused
          ? {
              trailingAction: (
                <SettingsButton onClick={props.onOpenSettings} />
              ),
            }
          : {})}
      />
      <Card className={styles.roleCard} data-tone={props.tone}>
        <props.Icon aria-hidden="true" focusable="false" size={42} strokeWidth={1.7} />
        <div className={styles.roleCopy}>
          <h2>{props.roleName}</h2>
          <p>{props.instruction}</p>
        </div>
      </Card>
      <div className={styles.actionArea}>
        {props.paused ? (
          <Card className={styles.notice} role="status">
            Ночь приостановлена. Включите звук и громкость в настройках,
            чтобы продолжить.
          </Card>
        ) : props.feedback ? (
          <Card className={styles.feedback} data-danger={props.feedback.danger} role="status">
            <span>{props.feedback.label}</span>
            <strong>{props.feedback.title}</strong>
          </Card>
        ) : props.targets.length > 0 ? (
          <TargetGrid
            targets={props.targets}
            selectedId={props.selectedId}
            onSelect={props.onSelect}
          />
        ) : props.emptyStateMessage ? (
          <Card className={styles.notice} role="status">
            {props.emptyStateMessage}
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
