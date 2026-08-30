import { ArrowRight, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AppShell } from "../../shared/ui/AppShell";
import { Button } from "../../shared/ui/Button";
import { InteractiveCard } from "../../shared/ui/InteractiveCard";
import styles from "./GameCollectionScreen.module.css";

export interface GameCollectionScreenProps {
  games: readonly GameCollectionItem[];
  onOpenSettings: () => void;
  onOpenGame: (gameId: string) => void;
}

export interface GameCollectionItem {
  id: string;
  title: string;
  description: string;
  continueDescription?: string;
  Icon: LucideIcon;
  iconTone?: "accent" | "danger";
  hasSavedSession: boolean;
}

export function GameCollectionScreen({
  games,
  onOpenSettings,
  onOpenGame,
}: GameCollectionScreenProps) {
  return (
    <AppShell ariaLabel="Коллекция игр">
      <header className={styles.header}>
        <Button
          className={styles.settings}
          variant="quiet"
          onClick={onOpenSettings}
        >
          <Settings aria-hidden="true" size={20} strokeWidth={1.8} />
          Настройки
        </Button>
        <h1 className={styles.title}>
          <span className={styles.brand}>sh1sha&apos;s</span> game collection
        </h1>
      </header>

      <section className={styles.games} aria-label="Игры">
        {games.map((game) => (
          <InteractiveCard
            key={game.id}
            Icon={game.Icon}
            {...(game.iconTone ? { iconTone: game.iconTone } : {})}
            title={game.title}
            description={
              game.hasSavedSession
                ? (game.continueDescription ?? "Продолжить текущую игру")
                : game.description
            }
            trailing={(
              <ArrowRight aria-hidden="true" size={24} strokeWidth={1.8} />
            )}
            onClick={() => onOpenGame(game.id)}
          />
        ))}
      </section>
    </AppShell>
  );
}
