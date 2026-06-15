export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h} hr${h > 1 ? "s" : ""} ${m} min`;
  if (h > 0) return `${h} hr${h > 1 ? "s" : ""}`;
  return `${m} min`;
}
