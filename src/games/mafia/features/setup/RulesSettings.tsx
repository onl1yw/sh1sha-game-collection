import { Eye, MicVocal } from "lucide-react";

import { Switch } from "../../../../shared/ui/Switch";
import styles from "./RulesSettings.module.css";

export interface RulesSettingsProps {
  hostByLot: boolean;
  revealRoles: boolean;
  onHostByLotChange: (enabled: boolean) => void;
  onRevealRolesChange: (enabled: boolean) => void;
}

export function RulesSettings({
  hostByLot,
  revealRoles,
  onHostByLotChange,
  onRevealRolesChange,
}: RulesSettingsProps) {
  return (
    <fieldset className={styles.root}>
      <legend className={styles.legend}>Правила</legend>
      <div className={styles.row}>
        <MicVocal aria-hidden="true" focusable="false" size={24} strokeWidth={1.8} />
        <span className={styles.title}>Ведущий по жеребьёвке</span>
        <Switch
          checked={hostByLot}
          label="Выбирать ведущего по жеребьёвке"
          onCheckedChange={onHostByLotChange}
        />
      </div>
      <div className={styles.row}>
        <Eye aria-hidden="true" focusable="false" size={24} strokeWidth={1.8} />
        <span className={styles.title}>Раскрывать роли</span>
        <Switch
          checked={revealRoles}
          label="Раскрывать роли выбывших игроков"
          onCheckedChange={onRevealRolesChange}
        />
      </div>
    </fieldset>
  );
}
