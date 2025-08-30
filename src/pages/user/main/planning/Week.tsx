import { useMemo, useState } from "react";
import { type LabelType, type WeekSchedule } from "@/types/planning";

import { labelColorUI, daysTitle } from "@/constants/planning";
import { getCurrentIsoWeek } from "@/utils/date";
import { timeToMinutes, minutesToTime } from "@/utils/time";
import { dayEnumToTitle, labelEnumToTitle, emptyWeek } from "@/utils/mappers";
import { useWeekPlanning } from "@/hooks/useWeekPLanning";

export default function Week() {
  const defaultIsoWeek = getCurrentIsoWeek();
  const [selectedWeek, setSelectedWeek] = useState<string>(defaultIsoWeek);
  const [labelFilter, setLabelFilter] = useState<"All" | LabelType>("All");

  const { apiWeek, isFetching } = useWeekPlanning(selectedWeek);

  const currentWeekData = useMemo<WeekSchedule>(() => {
    const next = emptyWeek();
    if (!apiWeek) return next;

    apiWeek.slots.forEach((s) => {
      const dayName = dayEnumToTitle(s.day);
      next[dayName].push({
        start: minutesToTime(s.startMinutes),
        end: minutesToTime(s.endMinutes),
        label: labelEnumToTitle(s.label),
      });
    });

    // Trier par heure de début
    for (const d of daysTitle) {
      next[d].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
    }
    return next;
  }, [apiWeek]);

  const filtered = (events: WeekSchedule[keyof WeekSchedule]) =>
    labelFilter === "All"
      ? events
      : events.filter((e) => e.label === labelFilter);

  const resetFilters = () => {
    setSelectedWeek(defaultIsoWeek);
    setLabelFilter("All");
  };

  return (
    <div className="w-full p-4 space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col">
          <label className="text-xs font-medium text-slate-600 mb-1">
            Semaine
          </label>
          <input
            type="week"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-medium text-slate-600 mb-1">
            Type
          </label>
          <select
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={labelFilter}
            onChange={(e) => setLabelFilter(e.target.value as any)}
          >
            <option value="All">All</option>
            <option value="Inbound">Inbound</option>
            <option value="Outbound">Outbound</option>
            <option value="Emailing">Emailing</option>
            <option value="Chat">Chat</option>
            <option value="Break">Break</option>
            <option value="Lunch">Lunch</option>
          </select>
        </div>

        <button
          onClick={resetFilters}
          className="ml-auto rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Reset
        </button>
      </div>

      {/* ====== Layout MOBILE: une ligne par jour (jour + chips d'événements) ====== */}
      <div className="md:hidden w-full">
        <div className="divide-y rounded-lg border">
          {daysTitle.map((day) => {
            const evts = filtered(currentWeekData[day] || []);
            return (
              <div key={day} className="flex items-start gap-3 p-3">
                {/* Jour */}
                <div className="w-24 shrink-0 text-sm font-semibold text-slate-700">
                  {day}
                </div>
                {/* Chips d'événements */}
                <div className="flex-1">
                  {isFetching ? (
                    <div className="text-xs text-slate-400 italic">
                      Chargement…
                    </div>
                  ) : evts.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {evts.map((ev, i) => (
                        <span
                          key={i}
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

      {/* ====== Layout DESKTOP: grille 7 colonnes ====== */}
      <div className="hidden md:block w-full overflow-x-auto">
        <div className="min-w-[900px]">
          {/* En-tête des jours */}
          <div className="grid grid-cols-7 items-end">
            {daysTitle.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-sm font-semibold text-slate-700"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grille 7 colonnes */}
          <div className="grid grid-cols-7 border-t border-slate-200">
            {daysTitle.map((day) => (
              <div
                key={day}
                className="border-r border-b border-slate-200 min-h-[220px] p-2 flex flex-col gap-2"
              >
                {isFetching ? (
                  <div className="text-xs text-slate-400 italic mt-1">
                    Chargement…
                  </div>
                ) : (
                  <>
                    {filtered(currentWeekData[day] || []).map((ev, i) => (
                      <div
                        key={i}
                        className={`w-full rounded-md px-3 py-2 text-xs font-semibold ring-1 ${
                          labelColorUI[ev.label]
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="opacity-80">
                            {ev.start} → {ev.end}
                          </span>
                          <span className="text-sm">{ev.label}</span>
                        </div>
                      </div>
                    ))}

                    {(!currentWeekData[day] ||
                      filtered(currentWeekData[day]).length === 0) && (
                      <div className="text-xs text-slate-400 italic mt-1">
                        Aucun événement
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Légende */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-medium text-slate-600">Légende :</span>
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
      </div>
    </div>
  );
}
