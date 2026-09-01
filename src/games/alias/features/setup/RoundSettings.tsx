import { Clock3, MinusCircle } from "lucide-react";

import { ChoiceGroup } from "../../../../shared/ui/ChoiceGroup";
import { NumberField } from "../../../../shared/ui/NumberField";
import { PresetNumberField } from "../../../../shared/ui/PresetNumberField";
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
  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Правила</h2>
      <div className={styles.setting}>
        <div className={styles.settingTitle}>
          <Clock3 aria-hidden="true" size={22} />
          <strong>Время раунда</strong>
        </div>
        <PresetNumberField
          label="Время раунда"
          value={props.durationSeconds}
          presets={[15, 30, 60].map((seconds) => ({
            value: seconds,
            label: `${seconds} сек`,
          }))}
          min={ALIAS_LIMITS.minDurationSeconds}
          max={ALIAS_LIMITS.maxDurationSeconds}
          customLabel="Своё время раунда"
          customPlaceholder="XX"
          suffix="сек"
          onChange={props.onDurationChange}
        />
      </div>
      <div className={styles.setting}>
        <h3 className={styles.subtitle}>Пропуски</h3>
        <div className={styles.toggleRow}>
          <MinusCircle aria-hidden="true" size={22} />
          <span>Вычитать очко за пропуск</span>
          <Switch
            checked={props.penalizeSkips}
            label="Вычитать очко за пропущенное слово"
            onCheckedChange={props.onPenaltyChange}
          />
        </div>
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
        <NumberField
          label="Очков для победы"
          value={props.winCondition.target}
          min={ALIAS_LIMITS.minTargetPoints}
          max={ALIAS_LIMITS.maxTargetPoints}
          onChange={(target) => props.onWinConditionChange({ type: "points", target })}
        />
      ) : (
        <NumberField
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
