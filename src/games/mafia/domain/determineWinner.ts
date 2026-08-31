import type { MafiaWinner, RoleAssignment } from "./types";

export function determineWinner(
  assignments: readonly RoleAssignment[],
  alivePlayerIds: readonly string[],
): MafiaWinner | null {
  const aliveIds = new Set(alivePlayerIds);
  const alive = assignments.filter((assignment) =>
    aliveIds.has(assignment.playerId) && assignment.team !== "neutral"
  );
  const townCount = alive.filter((assignment) => assignment.team === "town").length;
  const mafiaCount = alive.filter((assignment) => assignment.team === "mafia").length;
  const maniacCount = alive.filter((assignment) => assignment.role === "maniac").length;

  if (alive.length === 0) return "draw";
  if (alive.length === 1 && maniacCount === 1) return "maniac";
  if (mafiaCount === 0 && maniacCount === 0) {
    return townCount > 0 ? "town" : "draw";
  }
  if (maniacCount === 0 && mafiaCount > 0 && mafiaCount >= alive.length - mafiaCount) {
    return "mafia";
  }
  return null;
}
