import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import styles from "./ResultsScreen.module.css";

export interface ResultPlayer {
  id: string;
  name: string;
}

export interface ResultsScreenProps {
  secretWord: string;
  decoyWord?: string;
  spies: readonly ResultPlayer[];
  onOpenSettings: () => void;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export function ResultsScreen({
  secretWord,
  decoyWord,
  spies,
  onOpenSettings,
  onPlayAgain,
  onNewGame,
}: ResultsScreenProps) {
  return (
    <AppShell
      ariaLabel="Результаты раунда"
      actions={
        <>
          <Button fullWidth onClick={onPlayAgain}>
            Ещё раунд
          </Button>
          <Button fullWidth variant="secondary" onClick={onNewGame}>
            Новая игра (другая тема)
          </Button>
        </>
      }
    >
      <ScreenHeader
        eyebrow="Раунд окончен"
        title="Вот кто был шпионом"
        trailingAction={<SettingsButton onClick={onOpenSettings} />}
      />

      <Card className={styles.wordCard} tone="accent">
        <p className={styles.label}>Общий объект</p>
        <p className={styles.word}>{secretWord}</p>
        {decoyWord ? (
          <div className={styles.decoy}>
            <p className={styles.label}>Объект шпионов</p>
            <p className={styles.decoyWord}>{decoyWord}</p>
          </div>
        ) : null}
      </Card>

      <section className={styles.spies} aria-labelledby="spies-title">
        <h2 id="spies-title">Шпионы</h2>
        <ul>
          {spies.map((spy) => (
            <li key={spy.id}>{spy.name}</li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
