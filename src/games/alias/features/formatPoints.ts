export function formatPoints(value: number): string {
  return `${value} ${pointsWord(value)}`;
}

function pointsWord(value: number): string {
  const absolute = Math.abs(value);
  const lastTwo = absolute % 100;
  const last = absolute % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return "очков";
  if (last === 1) return "очко";
  if (last >= 2 && last <= 4) return "очка";
  return "очков";
}
