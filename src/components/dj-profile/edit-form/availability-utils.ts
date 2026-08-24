export function isValidMonthFormat(monthStr: string): boolean {
  if (!monthStr || !monthStr.includes("-")) return false;
  const [y, m] = monthStr.split("-").map(Number);
  if (!y || !m || Number.isNaN(y) || Number.isNaN(m)) return false;
  return m >= 1 && m <= 12 && y >= 2000 && y <= 2100;
}

export function daysInMonth(monthStr: string): number | null {
  if (!isValidMonthFormat(monthStr)) return null;
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

export function firstDayOffset(monthStr: string): number | null {
  if (!isValidMonthFormat(monthStr)) return null;
  const [y, m] = monthStr.split("-").map(Number);
  const dow = new Date(y, m - 1, 1).getDay(); // 0=Sun, 1=Mon
  return dow === 0 ? 6 : dow - 1; // shift so Mon=0
}
