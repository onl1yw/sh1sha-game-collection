import {
  Atom,
  Calculator,
  Castle,
  Cherry,
  Clapperboard,
  CupSoda,
  Globe2,
  Landmark,
  MapPin,
  Pill,
  Pickaxe,
  Popcorn,
  Shapes,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

import { Switch } from "../../../../shared/ui/Switch";
import type { AliasTheme } from "../../domain/theme";
import styles from "./ThemeSelector.module.css";

export interface ThemeSelectorProps {
  themes: readonly AliasTheme[];
  selectedIds: readonly string[];
  onToggle: (themeId: string) => void;
}

export function ThemeSelector({ themes, selectedIds, onToggle }: ThemeSelectorProps) {
  return (
    <fieldset className={styles.root}>
      <legend className={styles.legend}>Темы</legend>
      <p className={styles.hint}>Можно смешать несколько наборов в одной партии.</p>
      <div className={styles.list}>
        {themes.map((theme) => {
          const Icon = iconForTheme(theme.id);
          const checked = selectedIds.includes(theme.id);
          return (
            <div className={styles.row} key={theme.id}>
              <Icon aria-hidden="true" size={24} strokeWidth={1.8} />
              <span className={styles.copy}>
                <strong>{theme.name}</strong>
                <span>{theme.description}</span>
              </span>
              <Switch
                checked={checked}
                label={`${checked ? "Убрать" : "Добавить"} тему «${theme.name}»`}
                onCheckedChange={() => onToggle(theme.id)}
              />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

const ICONS: Readonly<Record<string, LucideIcon>> = {
  cinema: Clapperboard,
  physics: Atom,
  mathematics: Calculator,
  places: MapPin,
  minecraft: Pickaxe,
  disney: Castle,
  "phone-apps": Smartphone,
  "chip-flavors": Popcorn,
  drinks: CupSoda,
  politicians: Landmark,
  countries: Globe2,
  berries: Cherry,
  drugs: Pill,
};

function iconForTheme(themeId: string): LucideIcon {
  return ICONS[themeId] ?? Shapes;
}
