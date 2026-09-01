import { Clock3, Layers3 } from "lucide-react";

import { PresetNumberField } from "../../../../shared/ui/PresetNumberField";
import { HAT_LIMITS } from "../../domain/setup";
import { formatHatWords } from "../stagePresentation";
import styles from "./HatRules.module.css";

export interface HatRulesProps {
  wordCount: number;
  durationSeconds: number;
  availableWordCount: number;
  onWordCountChange: (count: number) => void;
  onDurationChange: (seconds: number) => void;
}

export function HatRules(props: HatRulesProps) {
  const maximumWords = Math.max(
    HAT_LIMITS.minWords,
    Math.min(HAT_LIMITS.maxWords, props.availableWordCount),
  );
  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Правила</h2>
      <div className={styles.setting}>
        <div className={styles.settingTitle}>
          <Layers3 aria-hidden="true" size={22} />
          <strong>Слов в шляпе</strong>
        </div>
        <PresetNumberField
          label="Слов в шляпе"
          value={props.wordCount}
          presets={[10, 30, 50].map((count) => ({
            value: count,
            label: `${count} слов`,
          }))}
          min={HAT_LIMITS.minWords}
          max={maximumWords}
          customLabel="Своё количество слов"
          customPlaceholder="XX"
          suffix={wordUnit(props.wordCount)}
          onChange={props.onWordCountChange}
        />
        <p className={styles.hint}>
          Доступно в выбранных темах: {formatHatWords(props.availableWordCount)}
        </p>
      </div>
      <div className={styles.setting}>
        <div className={styles.settingTitle}>
          <Clock3 aria-hidden="true" size={22} />
          <strong>Время хода</strong>
        </div>
        <PresetNumberField
          label="Время хода"
          value={props.durationSeconds}
          presets={[15, 30, 60].map((seconds) => ({
            value: seconds,
            label: `${seconds} сек`,
          }))}
          min={HAT_LIMITS.minDurationSeconds}
          max={HAT_LIMITS.maxDurationSeconds}
          customLabel="Своё время хода"
          customPlaceholder="XX"
          suffix="сек"
          onChange={props.onDurationChange}
        />
      </div>
    </div>
  );
}

function wordUnit(count: number): string {
  return formatHatWords(count).split(" ")[1] ?? "слов";
}
