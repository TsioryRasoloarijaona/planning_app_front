import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LabelType } from "@/types/planning";
import { labelColorUI, daysTitle as DAYS } from "@/constants/planning";
import { timeToMinutes, minutesToTime } from "@/utils/time";
import { buildMonthMatrix, currentMonthStr, todayIsoUTC } from "@/utils/month";
import { isoWeekStartUTC } from "@/utils/date";
import { get } from "@/hooks/fecthing/get";
import type { ApiDay, ApiLabel, ApiWeek } from "@/types/planning";
import { type MonthEvent } from "@/utils/monthEvent";

const dayOffset: Record<ApiDay, number> = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
  SATURDAY: 5,
  SUNDAY: 6,
};

function labelEnumToTitle(l: ApiLabel): LabelType {
  switch (l) {
    case "INBOUND":
      return "Inbound";
    case "OUTBOUND":
      return "Outbound";
    case "EMAILING":
      return "Emailing";
    case "CHAT":
      return "Chat";
    case "BREAK":
      return "Break";
    case "LUNCH":
      return "Lunch";
  }
}

function toISODateUTC(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ===== Composant ===== */
export default function Month() {
  const [month, setMonth] = useState<string>(currentMonthStr()); // "YYYY-MM"
  const today = useMemo(() => todayIsoUTC(), []);

  // Fetch des semaines couvrant le mois
  const {
    data: weeks,
    isFetching,
    isError,
  } = useQuery<ApiWeek[]>({
    queryKey: ["planning-month", month],
    queryFn: () => get<ApiWeek[]>(`planning/month/${month}`),
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  // Transforme semaines->événements du mois (avec date calculée par isoWeek + day)
  const events = useMemo<MonthEvent[]>(() => {
    if (!weeks || weeks.length === 0) return [];
    const out: MonthEvent[] = [];

    for (const w of weeks) {
      const monday = isoWeekStartUTC(w.isoWeek); // Date du lundi (UTC)
      for (const s of w.slots) {
        const offset = dayOffset[s.day];
        const d = new Date(monday);
        d.setUTCDate(monday.getUTCDate() + offset);
        const iso = toISODateUTC(d);

        // ne garde que les slots qui tombent dans le mois sélectionné
        if (!iso.startsWith(month)) continue;

        out.push({
          date: iso,
          start: minutesToTime(s.startMinutes),
          end: minutesToTime(s.endMinutes),
          label: labelEnumToTitle(s.label),
        });
      }
    }
    return out;
  }, [weeks, month]);

  // Indexation par date + tri par heure
  const eventsByDate = useMemo(() => {
    const map: Record<string, MonthEvent[]> = {};
    for (const e of events) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
    }
    return map;
  }, [events]);

  const matrix = useMemo(() => buildMonthMatrix(month), [month]);

  // Libellé court mobile (ex: "Mon 05")
  const dayLabel = (iso: string) => {
    const d = new Date(`${iso}T00:00:00Z`);
    const jsDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const name = jsDays[d.getUTCDay()];
    const num = iso.slice(-2);
    return `${name} ${num}`;
  };

  return (
    <div className="w-full p-4 space-y-4" lang="fr-FR">
      {/* Filtre + légende */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <label className="text-xs font-medium text-slate-600 mb-1">
            Mois
          </label>
          <input
            type="month"
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
          <span className="font-medium text-slate-600 mr-1 sm:mr-0">
            Légende :
          </span>
          {(
            [
              "Inbound",
              "Outbound",
              "Emailing",
              "Chat",
              "Break",
              "Lunch",
            ] as LabelType[]
          ).map((l) => (
            <span
              key={l}
              className={`rounded px-2 py-1 ring-1 ${labelColorUI[l]}`}
            >
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* États réseau simples */}
      {isError && (
        <div className="text-sm text-rose-600">
          Erreur de chargement du planning.
        </div>
      )}

      {/* ===== MOBILE: Liste des jours ===== */}
      <div className="md:hidden w-full">
        <div className="divide-y rounded-lg border">
          {matrix.map(({ date, inMonth }) => {
            const evts = eventsByDate[date] || [];
            const isToday = date === today;

            return (
              <div
                key={date}
                className={`flex items-start gap-3 p-3 ${
                  isToday ? "bg-blue-50" : inMonth ? "" : "bg-slate-50"
                }`}
              >
                {/* Date */}
                <div
                  className={`w-24 shrink-0 text-sm font-semibold ${
                    isToday
                      ? "text-blue-700"
                      : inMonth
                      ? "text-slate-700"
                      : "text-slate-400"
                  }`}
                >
                  {dayLabel(date)}
                </div>

                {/* Événements */}
                <div className="flex-1">
                  {isFetching ? (
                    <div className="text-[11px] text-slate-400 italic">
                      Chargement…
                    </div>
                  ) : evts.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {evts.map((ev, i) => (
                        <span
                          key={`${date}-${i}`}
                          className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-[11px] font-semibold ring-1 ${
                            labelColorUI[ev.label]
                          }`}
                        >
                          <span className="opacity-80">
                            {ev.start} → {ev.end}
                          </span>
                          <span>•</span>
                          <span>{ev.label}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">
                      Aucun événement
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== DESKTOP: Grille 7 colonnes ===== */}
      <div className="hidden md:block w-full overflow-x-auto">
        <div className="min-w-[900px]">
          {/* En-tête jours */}
          <div className="grid grid-cols-7 items-end">
            {DAYS.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-sm font-semibold text-slate-700"
              >
                {d}
              </div>
            ))}
          </div>

          {/* 6 semaines x 7 jours */}
          <div className="grid grid-cols-7 border-t border-slate-200">
            {matrix.map(({ date, inMonth }) => {
              const dayNum = Number(date.slice(-2));
              const evts = eventsByDate[date] || [];
              const isToday = date === today;

              return (
                <div
                  key={date}
                  className={`border-r border-b border-slate-200 min-h-[150px] p-2 flex flex-col gap-1 ${
                    isToday ? "bg-blue-50" : inMonth ? "" : "bg-slate-50"
                  }`}
                >
                  <div
                    className={`text-xs font-semibold mb-1 ${
                      isToday
                        ? "text-blue-700"
                        : inMonth
                        ? "text-slate-700"
                        : "text-slate-400"
                    }`}
                  >
                    {dayNum}
                  </div>

                  {isFetching ? (
                    <div className="text-[11px] text-slate-400 italic mt-1">
                      Chargement…
                    </div>
                  ) : evts.length > 0 ? (
                    evts.map((ev, i) => (
                      <div
                        key={`${date}-${i}`}
                        className={`rounded-md px-2 py-1 text-[11px] font-semibold ring-1 ${
                          labelColorUI[ev.label]
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="opacity-80">
                            {ev.start} → {ev.end}
                          </span>
                          <span>{ev.label}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-400 italic mt-1">
                      Aucun événement
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
