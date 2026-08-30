import { Moon, Sun, type LucideIcon } from "lucide-react";

import { AppShell } from "../../shared/ui/AppShell";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import type { ColorTheme } from "../../shared/ui/colorTheme";
import { SectionLabel } from "../../shared/ui/SectionLabel";
import { ScreenHeader } from "../../shared/ui/ScreenHeader";
import { Switch } from "../../shared/ui/Switch";
import styles from "./SettingsScreen.module.css";

export interface SettingsScreenProps {
  colorTheme: ColorTheme;
  showSensitiveThemes: boolean;
  onBack: () => void;
  onColorThemeChange: (theme: ColorTheme) => void;
  onSensitiveThemesChange: (show: boolean) => void;
}

export function SettingsScreen({
  colorTheme,
  showSensitiveThemes,
  onBack,
  onColorThemeChange,
  onSensitiveThemesChange,
}: SettingsScreenProps) {
  return (
    <AppShell ariaLabel="Настройки коллекции">
      <ScreenHeader title="Настройки" onBack={onBack} />

      <section className={styles.section} aria-labelledby="appearance-heading">
        <SectionLabel id="appearance-heading">Оформление</SectionLabel>
        <div className={styles.themeChoices}>
          <ThemeChoice
            active={colorTheme === "dark"}
            icon={Moon}
            label="Тёмная"
            onClick={() => onColorThemeChange("dark")}
          />
          <ThemeChoice
            active={colorTheme === "light"}
            icon={Sun}
            label="Светлая"
            onClick={() => onColorThemeChange("light")}
          />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="content-heading">
        <SectionLabel id="content-heading">Контент</SectionLabel>
        <Card className={styles.settingRow}>
          <span className={styles.settingTitle}>Чувствительные темы</span>
          <Switch
            checked={showSensitiveThemes}
            label="Показывать чувствительные темы"
            onCheckedChange={onSensitiveThemesChange}
          />
        </Card>
      </section>
    </AppShell>
  );
}

interface ThemeChoiceProps {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

function ThemeChoice({ active, icon: Icon, label, onClick }: ThemeChoiceProps) {
  return (
    <Button
      fullWidth
      variant="secondary"
      aria-pressed={active}
      onClick={onClick}
    >
      <Icon aria-hidden="true" size={24} strokeWidth={1.8} />
      {label}
    </Button>
  );
}
