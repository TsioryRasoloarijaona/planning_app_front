// Utils spécifiques à l'affichage mois
export function currentMonthStr(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`; // "YYYY-MM"
}

export function isoDate(y: number, mZero: number, d: number) {
  const yStr = String(y);
  const mStr = String(mZero + 1).padStart(2, "0");
  const dStr = String(d).padStart(2, "0");
  return `${yStr}-${mStr}-${dStr}`;
}

export function todayIsoUTC(): string {
  const now = new Date();
  return isoDate(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

function toMondayIndex(jsDay: number) {
  return (jsDay + 6) % 7;
}

export function buildMonthMatrix(ym: string): { date: string; inMonth: boolean }[] {
  const [yStr, mStr] = ym.split("-");
  const y = Number(yStr);
  const mZero = Number(mStr) - 1; // 0..11

  const first = new Date(Date.UTC(y, mZero, 1));
  const startOffset = toMondayIndex(first.getUTCDay()); // days to go back to Monday
  const gridStart = new Date(Date.UTC(y, mZero, 1 - startOffset));

  const days: { date: string; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart.getTime() + i * 86400000);
    days.push({
      date: isoDate(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
      inMonth: d.getUTCMonth() === mZero,
    });
  }
  return days;
}
