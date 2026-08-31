import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { InteractiveCard } from "../../../../shared/ui/InteractiveCard";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import { getThemeIcon } from "./themeIconRegistry";
import styles from "./ThemeSelectionScreen.module.css";

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  sensitive?: boolean;
}

export interface ThemeSelectionScreenProps {
  themes: readonly ThemeOption[];
  isLoading?: boolean;
  errorMessage?: string;
  onBack: () => void;
  onChooseTheme: (themeId: string) => void;
  onOpenSettings: () => void;
  onRetry?: () => void;
}

export function ThemeSelectionScreen({
  themes,
  isLoading = false,
  errorMessage,
  onBack,
  onChooseTheme,
  onOpenSettings,
  onRetry,
}: ThemeSelectionScreenProps) {
  return (
    <AppShell ariaLabel="Выбор темы">
      <ScreenHeader
        title="Выберите тему"
        backLabel="Все игры"
        onBack={onBack}
        trailingAction={<SettingsButton onClick={onOpenSettings} />}
      />

      {isLoading ? (
        <Card role="status" aria-live="polite">
          Загружаем темы…
        </Card>
      ) : null}

      {errorMessage ? (
        <Card className={styles.error} tone="danger" role="alert">
          <p>{errorMessage}</p>
          {onRetry ? (
            <Button variant="secondary" onClick={onRetry}>
              Попробовать снова
            </Button>
          ) : null}
        </Card>
      ) : null}

      {!isLoading && !errorMessage && themes.length === 0 ? (
        <Card role="status">Пока нет доступных тематик.</Card>
      ) : null}

      <div className={styles.list} role="group" aria-label="Доступные темы">
        {themes.map((theme) => (
          <InteractiveCard
            key={theme.id}
            Icon={getThemeIcon(theme.id)}
            title={theme.name}
            description={theme.description}
            onClick={() => onChooseTheme(theme.id)}
          />
        ))}
      </div>
    </AppShell>
  );
}
