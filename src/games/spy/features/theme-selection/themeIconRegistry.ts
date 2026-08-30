import {
  Castle,
  Cherry,
  CupSoda,
  Globe2,
  Landmark,
  Pill,
  Pickaxe,
  Popcorn,
  Shapes,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

const THEME_ICONS: Readonly<Partial<Record<string, LucideIcon>>> = {
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

export function getThemeIcon(themeId: string): LucideIcon {
  return THEME_ICONS[themeId] ?? Shapes;
}
