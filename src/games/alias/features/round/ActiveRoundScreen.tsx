import { Check, X } from "lucide-react";
import { useState } from "react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { GameExitAction } from "../../../../shared/ui/GameExitAction";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import { wordAt } from "../../domain/deck";
import type { AliasSession, WordOutcome } from "../../domain/types";
import { useRoundTimer } from "./useRoundTimer";
import { WordCard } from "./WordCard";
import styles from "./ActiveRoundScreen.module.css";

export interface ActiveRoundScreenProps {
  session: AliasSession;
  paused: boolean;
  onExit: () => void;
  onOpenSettings: () => void;
  onMark: (outcome: WordOutcome) => void;
  onExpire: () => void;
}

export function ActiveRoundScreen(props: ActiveRoundScreenProps) {
  const [cardExiting, setCardExiting] = useState(false);
  const [exitConfirming, setExitConfirming] = useState(false);
  const interactionsPaused = props.paused || exitConfirming;
  const remaining = useRoundTimer(
    props.session.setup.durationSeconds,
    props.onExpire,
    interactionsPaused,
  );
  const team = props.session.setup.teams[props.session.activeTeamIndex];
  const word = wordAt(props.session.deck, props.session.cursor);
  return (
    <AppShell
      ariaLabel="Раунд Alias"
      actions={(
        <div className={styles.actions}>
          <Button
            className={styles.action}
            variant="secondary"
            aria-label="Пропустить слово"
            disabled={cardExiting || interactionsPaused}
            onClick={() => props.onMark("skipped")}
          >
            <X aria-hidden="true" size={28} />
            <span>Пропустить</span>
          </Button>
          <Button
            className={styles.action}
            aria-label="Слово угадано"
            disabled={cardExiting || interactionsPaused}
            onClick={() => props.onMark("correct")}
          >
            <Check aria-hidden="true" size={30} />
            <span>Угадано</span>
          </Button>
        </div>
      )}
    >
      <ScreenHeader
        eyebrow={team?.name ?? "Команда"}
        title={formatTime(remaining)}
        description="Осталось времени"
        leadingAction={(
          <GameExitAction
            onConfirm={props.onExit}
            onOpenChange={setExitConfirming}
          />
        )}
        trailingAction={<SettingsButton onClick={props.onOpenSettings} />}
      />
      <WordCard
        word={word}
        onSwipe={props.onMark}
        onTransitionChange={setCardExiting}
      />
    </AppShell>
  );
}

function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
