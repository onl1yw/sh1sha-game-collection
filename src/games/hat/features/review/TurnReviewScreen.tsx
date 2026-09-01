import { Check, X } from "lucide-react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { GameExitAction } from "../../../../shared/ui/GameExitAction";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import { Switch } from "../../../../shared/ui/Switch";
import { includedClaimCount } from "../../domain/scoring";
import type { HatSession, TurnDraft } from "../../domain/types";
import { hatStageEyebrow } from "../stagePresentation";
import styles from "./TurnReviewScreen.module.css";

export interface TurnReviewScreenProps {
  session: HatSession;
  draft: TurnDraft;
  onToggle: (wordId: string) => void;
  onConfirm: () => void;
  onExit: () => void;
  onOpenSettings: () => void;
}

export function TurnReviewScreen(props: TurnReviewScreenProps) {
  const team = props.session.setup.teams.find(
    (candidate) => candidate.id === props.draft.teamId,
  );
  const claims = props.draft.correctClaims.map((claim) => ({
    ...claim,
    word: props.session.masterWords.find((word) => word.id === claim.wordId),
  })).filter((claim) => claim.word !== undefined);
  const score = includedClaimCount(props.draft.correctClaims);
  return (
    <AppShell
      ariaLabel="Проверка хода в Шляпе"
      actions={<Button fullWidth onClick={props.onConfirm}>Далее</Button>}
    >
      <ScreenHeader
        eyebrow={`${team?.name ?? "Команда"} · ${hatStageEyebrow(props.session.stageIndex)}`}
        title="Проверьте угаданные слова"
        description="Выключите слова, которые были засчитаны ошибочно"
        leadingAction={<GameExitAction onConfirm={props.onExit} />}
        trailingAction={<SettingsButton onClick={props.onOpenSettings} />}
      />
      <Card className={styles.summary} tone="accent">
        <span>Угадано за ход</span>
        <strong>{score}</strong>
      </Card>
      <Card className={styles.words}>
        {claims.length > 0 ? claims.map((claim) => (
          <div className={styles.word} data-included={claim.included} key={claim.wordId}>
            <span className={styles.outcome} aria-hidden="true">
              {claim.included ? <Check size={20} /> : <X size={20} />}
            </span>
            <strong>{claim.word?.text}</strong>
            <Switch
              checked={claim.included}
              label={`Засчитать слово «${claim.word?.text ?? ""}»`}
              onCheckedChange={() => props.onToggle(claim.wordId)}
            />
          </div>
        )) : (
          <p className={styles.empty}>За этот ход слова не угаданы.</p>
        )}
      </Card>
    </AppShell>
  );
}
