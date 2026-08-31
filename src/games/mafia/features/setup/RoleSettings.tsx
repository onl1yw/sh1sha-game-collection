import {
  Axe,
  Cigarette,
  Crown,
  Fingerprint,
  HeartHandshake,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { NumberStepper } from "../../../../shared/ui/NumberStepper";
import { ChoiceGroup } from "../../../../shared/ui/ChoiceGroup";
import type { LoverMode } from "../../domain/types";
import { RoleToggleRow } from "./RoleToggleRow";
import styles from "./RoleSettings.module.css";

export interface RoleSettingsProps {
  ordinaryMafiaCount: number;
  maxOrdinaryMafia: number;
  civilianCount: number;
  don: boolean;
  commissioner: boolean;
  doctor: boolean;
  lover: boolean;
  loverMode: LoverMode;
  loverAvailable: boolean;
  maniac: boolean;
  maniacAvailable: boolean;
  onOrdinaryMafiaCountChange: (count: number) => void;
  onDonChange: (enabled: boolean) => void;
  onCommissionerChange: (enabled: boolean) => void;
  onDoctorChange: (enabled: boolean) => void;
  onLoverChange: (enabled: boolean) => void;
  onLoverModeChange: (mode: LoverMode) => void;
  onManiacChange: (enabled: boolean) => void;
}

const LOVER_MODES = [
  {
    value: "protect-and-link",
    title: "Защита и связь",
    description: "Спасает цель ночью, но при гибели забирает её с собой.",
  },
  {
    value: "block-vote",
    title: "Без права голоса",
    description: "Цель не голосует на следующий день.",
  },
] as const;

export function RoleSettings(props: RoleSettingsProps) {
  return (
    <fieldset className={styles.root}>
      <legend className={styles.legend}>Роли</legend>
      <div className={styles.mafiaCount}>
        <Cigarette
          aria-hidden="true"
          className={styles.dangerIcon}
          focusable="false"
          size={26}
          strokeWidth={1.8}
        />
        <NumberStepper
          label="Мафия"
          value={props.ordinaryMafiaCount}
          min={1}
          max={props.maxOrdinaryMafia}
          onChange={props.onOrdinaryMafiaCountChange}
        />
      </div>
      <RoleToggleRow
        Icon={Crown}
        title="Дон"
        description="Ищет комиссара и играет за мафию"
        enabled={props.don}
        tone="danger"
        onChange={props.onDonChange}
      />
      <RoleToggleRow
        Icon={Fingerprint}
        title="Комиссар"
        description="Проверяет одного игрока за ночь"
        enabled={props.commissioner}
        onChange={props.onCommissionerChange}
      />
      <RoleToggleRow
        Icon={Stethoscope}
        title="Доктор"
        description="Спасает одного игрока за ночь"
        enabled={props.doctor}
        onChange={props.onDoctorChange}
      />
      <RoleToggleRow
        Icon={HeartHandshake}
        title="Любовница"
        description={props.loverAvailable
          ? "Выбирает одного игрока каждую ночь"
          : "Доступна от 7 игроков"}
        enabled={props.lover}
        disabled={!props.loverAvailable}
        onChange={props.onLoverChange}
      />
      {props.lover ? (
        <div className={styles.loverMode}>
          <ChoiceGroup
            legend="Способность любовницы"
            value={props.loverMode}
            options={LOVER_MODES}
            onChange={props.onLoverModeChange}
          />
        </div>
      ) : null}
      <RoleToggleRow
        Icon={Axe}
        title="Маньяк"
        description={props.maniacAvailable ? "Играет сам за себя" : "Доступен от 9 игроков"}
        enabled={props.maniac}
        disabled={!props.maniacAvailable}
        tone="danger"
        onChange={props.onManiacChange}
      />
      <div className={styles.civilianRow}>
        <UserRound
          aria-hidden="true"
          className={styles.accentIcon}
          focusable="false"
          size={26}
          strokeWidth={1.8}
        />
        <span className={styles.civilianCopy}>
          <span className={styles.civilianTitle}>Мирные жители</span>
          <span className={styles.civilianDescription}>Заполняют свободные места</span>
        </span>
        <output className={styles.civilianCount} aria-label="Мирных жителей">
          {props.civilianCount}
        </output>
      </div>
    </fieldset>
  );
}
