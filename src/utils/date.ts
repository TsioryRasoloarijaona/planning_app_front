export function getCurrentIsoWeek(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function isoWeekStartUTC(isoWeek: string): Date {
  const [yStr, wStr] = isoWeek.split("-W");
  const y = +yStr;
  const w = +wStr;
  const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
  const dow = simple.getUTCDay() || 7;
  const isoMonday = new Date(simple);
  isoMonday.setUTCDate(simple.getUTCDate() - (dow <= 4 ? dow - 1 : dow - 8));
  return isoMonday;
}

export function isoWeekEndUTC(isoWeek: string): Date {
  const s = isoWeekStartUTC(isoWeek);
  const e = new Date(s);
  e.setUTCDate(s.getUTCDate() + 7);
  return e;
}
