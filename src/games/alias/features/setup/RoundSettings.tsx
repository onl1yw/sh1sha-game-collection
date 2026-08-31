import { Clock3, MinusCircle } from "lucide-react";

import { Button } from "../../../../shared/ui/Button";
import { ChoiceGroup } from "../../../../shared/ui/ChoiceGroup";
import { NumberStepper } from "../../../../shared/ui/NumberStepper";
import { Switch } from "../../../../shared/ui/Switch";
import { ALIAS_LIMITS } from "../../domain/setup";
import type { WinCondition } from "../../domain/types";
import styles from "./RoundSettings.module.css";

export interface RoundSettingsProps {
  durationSeconds: number;
  penalizeSkips: boolean;
  winCondition: WinCondition;
  onDurationChange: (seconds: number) => void;
  onPenaltyChange: (enabled: boolean) => void;
  onWinConditionChange: (condition: WinCondition) => void;
}

export function RoundSettings(props: RoundSettingsProps) {
  const preset = [15, 30, 60].includes(props.durationSeconds);
  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Правила</h2>
      <div className={styles.setting}>
        <div className={styles.settingTitle}>
          <Clock3 aria-hidden="true" size={22} />
          <strong>Время раунда</strong>
        </div>
        <div className={styles.presets} aria-label="Время раунда">
          {[15, 30, 60].map((seconds) => (
            <Button
              key={seconds}
              variant="secondary"
              aria-pressed={props.durationSeconds === seconds}
              onClick={() => props.onDurationChange(seconds)}
            >
              {seconds} сек
            </Button>
          ))}
          <Button
            variant="secondary"
            aria-pressed={!preset}
            onClick={() => props.onDurationChange(preset ? 45 : props.durationSeconds)}
          >
            Своё
          </Button>
        </div>
        {!preset ? (
          <NumberStepper
            label="Секунд"
            value={props.durationSeconds}
            min={ALIAS_LIMITS.minDurationSeconds}
            max={ALIAS_LIMITS.maxDurationSeconds}
            onChange={props.onDurationChange}
          />
        ) : null}
      </div>
      <div className={styles.toggleRow}>
        <MinusCircle aria-hidden="true" size={22} />
        <span>Вычитать очко за пропуск</span>
        <Switch
          checked={props.penalizeSkips}
          label="Вычитать очко за пропущенное слово"
          onCheckedChange={props.onPenaltyChange}
        />
      </div>
      <ChoiceGroup
        legend="Условие победы"
        value={props.winCondition.type}
        options={[
          { value: "points", title: "До нужного количества очков" },
          { value: "rounds", title: "Кто наберёт больше за несколько раундов" },
        ]}
        onChange={(type) => props.onWinConditionChange(type === "points"
          ? { type, target: 30 }
          : { type, roundsPerTeam: 3 })}
      />
      {props.winCondition.type === "points" ? (
        <NumberStepper
          label="Очков для победы"
          value={props.winCondition.target}
          min={ALIAS_LIMITS.minTargetPoints}
          max={ALIAS_LIMITS.maxTargetPoints}
          onChange={(target) => props.onWinConditionChange({ type: "points", target })}
        />
      ) : (
        <NumberStepper
          label="Раундов на команду"
          value={props.winCondition.roundsPerTeam}
          min={ALIAS_LIMITS.minRounds}
          max={ALIAS_LIMITS.maxRounds}
          onChange={(roundsPerTeam) => props.onWinConditionChange({
            type: "rounds",
            roundsPerTeam,
          })}
        />
      )}
    </div>
  );
}
