import type { LabelType } from "@/types/planning";
import { isoDate } from "@/utils/month";

export type MonthEvent = {
  date: string;      // "YYYY-MM-DD"
  start: string;     // "HH:mm"
  end: string;       // "HH:mm"
  label: LabelType;  // Inbound | Outbound | Emailing | Chat | Break | Lunch
};

// Génère des données mock pour un mois donné "YYYY-MM"
export function generateMockEvents(ym: string): MonthEvent[] {
  const [yStr, mStr] = ym.split("-");
  const y = Number(yStr);
  const mZero = Number(mStr) - 1;

  const sampleDays = [2, 5, 9, 12, 13, 18, 21, 23, 26, 28];
  const sampleLabels: LabelType[] = [
    "Inbound",
    "Outbound",
    "Emailing",
    "Chat",
    "Break",
    "Lunch",
  ];

  const events: MonthEvent[] = [];
  sampleDays.forEach((d, i) => {
    const date = isoDate(y, mZero, d);
    const a = i % sampleLabels.length;
    const b = (i + 1) % sampleLabels.length;

    events.push(
      { date, start: "09:00", end: "10:00", label: sampleLabels[a] },
      { date, start: "11:00", end: "12:00", label: sampleLabels[b] }
    );

    if (i % 3 === 0) {
      events.push({ date, start: "15:00", end: "16:00", label: "Inbound" });
    }
  });

  return events;
}
