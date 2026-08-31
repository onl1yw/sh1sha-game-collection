import { ArrowRight, FolderGit2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AppShell } from "../../shared/ui/AppShell";
import { AppBar } from "../../shared/ui/AppBar";
import { InteractiveCard } from "../../shared/ui/InteractiveCard";
import { SettingsButton } from "../../shared/ui/SettingsButton";
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
      <AppBar>
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
              <FolderGit2 aria-hidden="true" size={22} strokeWidth={1.8} />
              GitHub
            </a>
            <SettingsButton showLabel onClick={onOpenSettings} />
          </div>
          <h1 className={styles.title}>
            <span className={styles.brand}>sh1sha&apos;s</span> game collection
          </h1>
        </header>
      </AppBar>

      <section className={styles.games} aria-label="Игры">
        {games.map((game) => (
          <InteractiveCard
            key={game.id}
            Icon={game.Icon}
            {...(game.iconTone ? { iconTone: game.iconTone } : {})}
            layout="tile"
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
