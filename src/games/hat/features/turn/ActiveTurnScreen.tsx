import { Check, X } from "lucide-react";
import { useRef, useState } from "react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { GameExitAction } from "../../../../shared/ui/GameExitAction";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import type { HatSession, TurnDraft } from "../../domain/types";
import {
  formatHatWords,
  hatStageEyebrow,
  hatStagePresentation,
} from "../stagePresentation";
import {
  HatWordCard,
  type HatWordCardHandle,
  type HatWordOutcome,
} from "./HatWordCard";
import { formatDuration, useTurnTimer } from "./useTurnTimer";
import styles from "./ActiveTurnScreen.module.css";

export interface ActiveTurnScreenProps {
  session: HatSession;
  draft: TurnDraft;
  paused: boolean;
  onExit: () => void;
  onOpenSettings: () => void;
  onCorrect: (remainingMs: number) => void;
  onSkip: () => void;
  onExpire: () => void;
}

export function ActiveTurnScreen(props: ActiveTurnScreenProps) {
  const cardRef = useRef<HatWordCardHandle>(null);
  const [cardExiting, setCardExiting] = useState(false);
  const [exitConfirmationOpen, setExitConfirmationOpen] = useState(false);
  const timerPaused = props.paused || exitConfirmationOpen || cardExiting;
  const remainingMs = useTurnTimer(
    props.draft.segmentBudgetMs,
    props.onExpire,
    timerPaused,
  );
  const team = props.session.setup.teams.find(
    (candidate) => candidate.id === props.draft.teamId,
  );
  const currentId = props.draft.queueWordIds[0];
  const word = props.session.masterWords.find((candidate) => candidate.id === currentId);
  if (!word) throw new Error("Hat active turn needs a current word");

  const mark = (outcome: HatWordOutcome) => {
    if (outcome === "correct") props.onCorrect(remainingMs);
    else props.onSkip();
  };
  const controlsDisabled = cardExiting || timerPaused;
  return (
    <AppShell
      ariaLabel="Ход в Шляпе"
      actions={(
        <div className={styles.actions}>
          <Button
            className={styles.action}
            variant="secondary"
            aria-label="Пропустить слово"
            disabled={controlsDisabled}
            onClick={() => cardRef.current?.exit("skipped")}
          >
            <X aria-hidden="true" size={28} />
            <span>Пропустить</span>
          </Button>
          <Button
            className={styles.action}
            aria-label="Слово угадано"
            disabled={controlsDisabled}
            onClick={() => cardRef.current?.exit("correct")}
          >
            <Check aria-hidden="true" size={30} />
            <span>Угадано</span>
          </Button>
        </div>
      )}
    >
      <ScreenHeader
        eyebrow={`${team?.name ?? "Команда"} · ${hatStageEyebrow(props.session.stageIndex)}`}
        title={formatDuration(remainingMs)}
        description={`${hatStagePresentation(props.session.stageIndex).title} · В шляпе ${formatHatWords(props.draft.queueWordIds.length)}`}
        leadingAction={(
          <GameExitAction
            onConfirm={props.onExit}
            onOpenChange={setExitConfirmationOpen}
          />
        )}
        trailingAction={<SettingsButton onClick={props.onOpenSettings} />}
      />
      <HatWordCard
        ref={cardRef}
        word={word}
        prompt={hatStagePresentation(props.session.stageIndex).prompt}
        disabled={timerPaused}
        onOutcome={mark}
        onTransitionChange={setCardExiting}
      />
    </AppShell>
  );
}
