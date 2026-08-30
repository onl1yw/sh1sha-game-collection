import { ArrowRight, GitFork, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AppShell } from "../../shared/ui/AppShell";
import { Button } from "../../shared/ui/Button";
import { InteractiveCard } from "../../shared/ui/InteractiveCard";
import styles from "./GameCollectionScreen.module.css";

const REPOSITORY_URL = "https://github.com/onl1yw/sh1sha-game-collection";

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
        <div className={styles.toolbar}>
          <a
            className={styles.github}
            href={REPOSITORY_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Открыть GitHub проекта"
            title="GitHub"
          >
            <GitFork aria-hidden="true" size={22} strokeWidth={1.8} />
          </a>
          <Button variant="quiet" onClick={onOpenSettings}>
            <Settings aria-hidden="true" size={20} strokeWidth={1.8} />
            Настройки
          </Button>
        </div>
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
