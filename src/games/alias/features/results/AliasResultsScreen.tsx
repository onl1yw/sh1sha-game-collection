import { Medal } from "lucide-react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import { leadingTeamIds } from "../../domain/scoring";
import type { AliasSession } from "../../domain/types";
import { formatPoints } from "../formatPoints";
import styles from "./AliasResultsScreen.module.css";

export interface AliasResultsScreenProps {
  session: AliasSession;
  onPlayAgain: () => void;
  onExit: () => void;
  onOpenSettings: () => void;
}

export function AliasResultsScreen(props: AliasResultsScreenProps) {
  const leaders = leadingTeamIds(props.session);
  const sortedTeams = [...props.session.setup.teams]
    .sort((left, right) => (props.session.scores[right.id] ?? 0)
      - (props.session.scores[left.id] ?? 0));
  const title = resultTitle(props.session, leaders);
  return (
    <AppShell
      ariaLabel="Результаты Alias"
      actions={(
        <>
          <Button fullWidth onClick={props.onPlayAgain}>Ещё партию</Button>
          <Button fullWidth variant="secondary" onClick={props.onExit}>Все игры</Button>
        </>
      )}
    >
      <ScreenHeader
        eyebrow="Игра окончена"
        title={title}
        description="Финальный счёт"
        trailingAction={<SettingsButton onClick={props.onOpenSettings} />}
      />
      <Card className={styles.scoreboard}>
        {sortedTeams.map((team, index) => (
          <div className={styles.team} data-leading={leaders.includes(team.id)} key={team.id}>
            <span className={styles.place}>
              {leaders.includes(team.id)
                ? <Medal aria-hidden="true" size={26} />
                : index + 1}
            </span>
            <strong className={styles.name}>{team.name}</strong>
            <span className={styles.score}>{props.session.scores[team.id] ?? 0}</span>
          </div>
        ))}
      </Card>
    </AppShell>
  );
}

function resultTitle(session: AliasSession, leaderIds: readonly string[]): string {
  if (session.setup.teams.length === 1) {
    return formatPoints(session.scores[session.setup.teams[0]?.id ?? ""] ?? 0);
  }
  if (leaderIds.length > 1) return "Ничья";
  const leader = session.setup.teams.find((team) => team.id === leaderIds[0]);
  return `Победила ${leader?.name ?? "команда"}`;
}
