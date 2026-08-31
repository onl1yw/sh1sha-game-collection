import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import type { MafiaRole, MafiaWinner } from "../../domain/types";
import { presentationForRole } from "../rolePresentation";
import styles from "./ResultsScreen.module.css";

export interface ResultPlayer {
  id: string;
  name: string;
  role: MafiaRole;
}

export interface ResultsScreenProps {
  winner: MafiaWinner;
  players: readonly ResultPlayer[];
  onOpenSettings: () => void;
  onPlayAgain: () => void;
  onExit: () => void;
}

export function ResultsScreen(props: ResultsScreenProps) {
  const winner = winnerCopy(props.winner);
  return (
    <AppShell
      ariaLabel="Результаты Мафии"
      actions={(
        <>
          <Button fullWidth onClick={props.onPlayAgain}>
            Ещё партию
          </Button>
          <Button fullWidth variant="secondary" onClick={props.onExit}>
            Все игры
          </Button>
        </>
      )}
    >
      <ScreenHeader
        eyebrow="Игра окончена"
        title={winner.title}
        description={winner.description}
        trailingAction={(
          <SettingsButton onClick={props.onOpenSettings} />
        )}
      />
      <Card className={styles.roles}>
        <h2>Кто кем был</h2>
        <div className={styles.list}>
          {props.players.map((player) => {
            const role = presentationForRole(player.role);
            return (
              <div className={styles.player} data-tone={role.tone} key={player.id}>
                <role.Icon aria-hidden="true" focusable="false" size={24} strokeWidth={1.8} />
                <span>{player.name}</span>
                <strong>{role.name}</strong>
              </div>
            );
          })}
        </div>
      </Card>
    </AppShell>
  );
}

function winnerCopy(winner: MafiaWinner): { title: string; description: string } {
  if (winner === "draw") {
    return { title: "Ничья", description: "В городе не осталось выживших" };
  }
  if (winner === "town") {
    return { title: "Победили мирные", description: "Вся мафия покинула город" };
  }
  if (winner === "mafia") {
    return { title: "Победила мафия", description: "Мафия получила контроль над городом" };
  }
  return { title: "Победил маньяк", description: "В городе не осталось соперников" };
}
