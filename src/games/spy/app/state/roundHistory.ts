import type {
  GameRound,
  SpyHistoryEntry,
} from "../../domain/game/types";
import type { Player } from "../../domain/player/types";
import type { Theme } from "../../domain/theme/types";
import { minimumKnownCount } from "../../domain/game/fairSelection";
import type { FairnessHistory } from "./persistenceModels";

interface NextHistoryInput {
  previous: FairnessHistory;
  players: readonly Player[];
  theme: Theme;
  round: GameRound;
  nextSpyHistory: readonly SpyHistoryEntry[];
}

export function buildNextFairnessHistory({
  previous,
  players,
  theme,
  round,
  nextSpyHistory,
}: NextHistoryInput): FairnessHistory {
  return {
    roundNumber: round.number,
    spies: mergeSpyHistory(previous.spies, nextSpyHistory),
    starters: updateStarterHistory(
      previous.starters,
      players,
      round.firstPlayerId,
      round.number,
    ),
    recentWordsByTheme: {
      ...previous.recentWordsByTheme,
      [theme.id]: updateRecentTargets(
        previous.recentWordsByTheme[theme.id] ?? [],
        round,
        theme,
      ),
    },
  };
}

function mergeSpyHistory(
  previous: FairnessHistory["spies"],
  current: readonly SpyHistoryEntry[],
): FairnessHistory["spies"] {
  const merged = new Map(previous.map((entry) => [entry.playerId, entry]));
  current.forEach((entry) => merged.set(entry.playerId, { ...entry }));
  return [...merged.values()];
}

function updateStarterHistory(
  previous: FairnessHistory["starters"],
  players: readonly Player[],
  firstPlayerId: string,
  roundNumber: number,
): FairnessHistory["starters"] {
  const merged = new Map(previous.map((entry) => [entry.playerId, entry]));
  const newcomerBaseline = minimumKnownCount(players.map(
    (player) => merged.get(player.id)?.starts,
  ));
  players.forEach((player) => {
    const entry = merged.get(player.id);
    const isFirst = player.id === firstPlayerId;
    merged.set(player.id, {
      playerId: player.id,
      starts: (entry?.starts ?? newcomerBaseline) + (isFirst ? 1 : 0),
      lastStartRound: isFirst
        ? roundNumber
        : (entry?.lastStartRound ?? null),
    });
  });
  return [...merged.values()];
}

function updateRecentTargets(
  previous: readonly string[],
  round: GameRound,
  theme: Theme,
): string[] {
  const unique = new Map<string, string>();
  [...previous, round.targetWord].forEach((word) => {
    const normalized = word.trim().toLocaleLowerCase("ru-RU");
    unique.delete(normalized);
    unique.set(normalized, word);
  });

  const totalWords = theme.groups.reduce(
    (count, group) => count + group.items.length,
    0,
  );
  const historyLimit = Math.max(1, totalWords - 1);
  return [...unique.values()].slice(-historyLimit);
}
