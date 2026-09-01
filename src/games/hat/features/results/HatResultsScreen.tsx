import { Clock3, Medal } from "lucide-react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { Card } from "../../../../shared/ui/Card";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import { leadingHatTeamIds } from "../../domain/scoring";
import type { HatSession } from "../../domain/types";
import { formatHatTurns, formatHatWords } from "../stagePresentation";
import { formatDuration } from "../turn/useTurnTimer";
import styles from "./HatResultsScreen.module.css";

export interface HatResultsScreenProps {
  session: HatSession;
  onPlayAgain: () => void;
  onExit: () => void;
  onOpenSettings: () => void;
}

export function HatResultsScreen(props: HatResultsScreenProps) {
  const isSolo = props.session.setup.teams.length === 1;
  const leaders = leadingHatTeamIds(props.session);
  const sortedTeams = [...props.session.setup.teams].sort(
    (left, right) => (props.session.scores[right.id] ?? 0)
      - (props.session.scores[left.id] ?? 0),
  );
  return (
    <AppShell
      ariaLabel="Результаты Шляпы"
      actions={(
        <>
          <Button fullWidth onClick={props.onPlayAgain}>Ещё партию</Button>
          <Button fullWidth variant="secondary" onClick={props.onExit}>Все игры</Button>
        </>
      )}
    >
      <ScreenHeader
        eyebrow="Игра окончена"
        title={isSolo ? "Все три этапа пройдены" : resultTitle(props.session, leaders)}
        description={isSolo ? "Ваш результат" : "Финальный счёт"}
        trailingAction={<SettingsButton onClick={props.onOpenSettings} />}
      />
      {isSolo ? (
        <SoloResult session={props.session} />
      ) : (
        <>
          <TeamResults session={props.session} teams={sortedTeams} leaders={leaders} />
          <GameMetrics session={props.session} />
        </>
      )}
    </AppShell>
  );
}

function SoloResult({ session }: { session: HatSession }) {
  const turns = totalTurns(session);
  return (
    <Card className={styles.solo} tone="accent">
      <div>
        <span>Ходов</span>
        <strong>{turns}</strong>
      </div>
      <div>
        <span>Игровое время</span>
        <strong>{formatDuration(totalPlayMs(session))}</strong>
      </div>
    </Card>
  );
}

function TeamResults(props: {
  session: HatSession;
  teams: HatSession["setup"]["teams"];
  leaders: readonly string[];
}) {
  return (
    <Card className={styles.scoreboard}>
      {props.teams.map((team, index) => (
        <div
          className={styles.team}
          data-leading={props.leaders.includes(team.id)}
          key={team.id}
        >
          <span className={styles.place}>
            {props.leaders.includes(team.id)
              ? <Medal aria-hidden="true" size={26} />
              : index + 1}
          </span>
          <strong className={styles.name}>{team.name}</strong>
          <span className={styles.score}>{props.session.scores[team.id] ?? 0}</span>
        </div>
      ))}
    </Card>
  );
}

function GameMetrics({ session }: { session: HatSession }) {
  return (
    <Card className={styles.metrics}>
      <Clock3 aria-hidden="true" size={24} />
      <span>{formatHatWords(session.masterWords.length)} · {formatHatTurns(totalTurns(session))}</span>
      <strong>{formatDuration(totalPlayMs(session))}</strong>
    </Card>
  );
}

function resultTitle(session: HatSession, leaderIds: readonly string[]): string {
  if (leaderIds.length > 1) return "Ничья";
  const leader = session.setup.teams.find((team) => team.id === leaderIds[0]);
  return `Победители: «${leader?.name ?? "Команда"}»`;
}

function totalTurns(session: HatSession): number {
  return Object.values(session.turnsStarted).reduce((total, turns) => total + turns, 0);
}

function totalPlayMs(session: HatSession): number {
  return Object.values(session.activePlayMs).reduce((total, time) => total + time, 0);
}
