import { useMemo, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import clsx from "clsx";
import { toast } from "sonner";

import { post } from "@/hooks/fecthing/post";
import type { Account } from "@/interfaces/LoginRes";

import type { ApiLabel, ApiDay, FormValues } from "@/types/planning";
import {
  labelPretty,
  labelColors,
  daysTitle,
  dayToEnum,
  enumToDay,
} from "@/constants/planning";
import { getCurrentIsoWeek, isoWeekEndUTC } from "@/utils/date";
import { timeToMinutes } from "@/utils/time";
import { useAccountSuggestions } from "@/hooks/useAccountSuggestions";

export default function PlanningCreate() {
  const defaultIso = getCurrentIsoWeek();

  const { control, register, handleSubmit, watch, setValue, getValues, reset } =
    useForm<FormValues>({
      defaultValues: { isoWeek: defaultIso, accountId: null, slots: [] },
    });

  const { fields, append, remove } = useFieldArray({ control, name: "slots" });
  const [accountQuery, setAccountQuery] = useState("");
  const [showSug, setShowSug] = useState(false);
  const {
    loading: accLoading,
    error: accError,
    suggestions: accountSuggestions,
  } = useAccountSuggestions(accountQuery, 300);

  const onPickAccount = (acc: Account) => {
    setValue("accountId", Number(acc.id));
    setAccountQuery(`${acc.name} (${acc.email})`);
    setShowSug(false);
  };

  /* ---------------- Slots helpers ---------------- */
  const addRow = (dayTitle: (typeof daysTitle)[number]) => {
    append({
      day: dayToEnum[dayTitle],
      start: "09:00",
      end: "10:00",
      label: "INBOUND", // label par défaut
    });
  };

  const fieldsByDay = useMemo(() => {
    const grouped: Record<
      (typeof daysTitle)[number],
      Array<{ idx: number }>
    > = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };
    fields.forEach((_, idx) => {
      const d = watch(`slots.${idx}.day`) as ApiDay;
      grouped[enumToDay(d)].push({ idx });
    });
    const vals = watch("slots") ?? [];
    (Object.keys(grouped) as Array<(typeof daysTitle)[number]>).forEach((d) => {
      grouped[d].sort(
        (a, b) =>
          timeToMinutes(vals[a.idx]?.start ?? "00:00") -
          timeToMinutes(vals[b.idx]?.start ?? "00:00")
      );
    });
    return grouped;
  }, [fields, watch]);

  /* ---------------- Submit (POST /planning) ---------------- */
  const onSubmit = async (values: FormValues) => {
    if (!values.accountId) {
      toast.error("Veuillez sélectionner un agent");
      return;
    }

    const payload = {
      isoWeek: values.isoWeek,
      weekEnd: isoWeekEndUTC(values.isoWeek).toISOString(),
      account: { connect: { id: values.accountId } },
      slots: {
        create: values.slots.map((s) => ({
          day: s.day,
          startMinutes: timeToMinutes(s.start),
          endMinutes: timeToMinutes(s.end),
          label: s.label,
        })),
      },
    };

    try {
      await post("planning", payload);
      toast.success("Le planning a été créé avec succès");
      reset({ isoWeek: values.isoWeek, accountId: null, slots: [] });
      setAccountQuery("");
      setShowSug(false);
    } catch (e: any) {
      toast.error("Cet agent a déjà un planning pour cette semaine");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full p-4 space-y-4"
      lang="fr-FR"
    >
      {/* Barre du haut */}
      <div className="grid grid-cols-[200px_1fr_auto] items-end gap-4 w-1/2">
        {/* Semaine */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-slate-600 mb-1">
            Semaine
          </label>
          <input
            type="week"
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            {...register("isoWeek")}
          />
        </div>

        {/* Agent + suggestions */}
        <div className="relative flex flex-col">
          <label className="text-xs font-medium text-slate-600 mb-1">
            Agent
          </label>
          <input
            type="text"
            placeholder="Rechercher nom ou email…"
            className="h-10 rounded-md border border-slate-300 px-3 text-sm w-full"
            value={accountQuery}
            onFocus={() => setShowSug(true)}
            onChange={(e) => {
              setAccountQuery(e.target.value);
              setShowSug(true);
            }}
            onBlur={() => setTimeout(() => setShowSug(false), 120)}
          />

          {showSug && accountQuery.trim() !== "" && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50 border rounded-md bg-white shadow text-sm max-h-56 overflow-auto">
              {accLoading && (
                <div className="px-3 py-2 text-slate-500">Chargement…</div>
              )}
              {accError && (
                <div className="px-3 py-2 text-rose-600">{accError}</div>
              )}

              {!accLoading && !accError && (
                <>
                  {accountSuggestions.length === 0 ? (
                    <div className="px-3 py-2 text-slate-400 italic">
                      Aucune correspondance
                    </div>
                  ) : (
                    accountSuggestions.map((a) => (
                      <button
                        type="button"
                        key={String(a.id)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => onPickAccount(a)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50"
                      >
                        <span className="font-medium">{a.name}</span>{" "}
                        <span className="text-slate-500">({a.email})</span>
                      </button>
                    ))
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="self-end h-10 rounded-md bg-gray-700 px-4 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Créer le planning
        </button>
      </div>

      {/* En-têtes des jours */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[900px]">
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

          {/* Grille d’édition */}
          <div className="grid grid-cols-7 border-t border-slate-200">
            {daysTitle.map((day) => {
              const group = fieldsByDay[day]; // ✅ pas de hook dans la boucle
              return (
                <div
                  key={day}
                  className="border-r border-b border-slate-200 min-h-[240px] p-3 flex flex-col gap-2"
                >
                  {group.map(({ idx }) => {
                    const selected = (watch(`slots.${idx}.label`) ??
                      "INBOUND") as ApiLabel;
                    const globalIndex = fields.findIndex(
                      (f) => f.id === fields[idx].id
                    );

                    return (
                      <div
                        key={fields[idx].id}
                        className={clsx(
                          "relative w-full rounded-md ring-1 p-2",
                          labelColors[selected]
                        )}
                      >
                        {/* Bouton fermer */}
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white text-slate-600 shadow ring-1 ring-slate-200 hover:text-red-600"
                          onClick={() => remove(globalIndex)}
                          title="Supprimer"
                        >
                          ✕
                        </button>

                        {/* Inputs en colonne */}
                        <div className="grid grid-cols-1 gap-2">
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[11px] opacity-70">
                                Début
                              </span>
                              <input
                                type="time"
                                lang="fr-FR"
                                inputMode="numeric"
                                step={300}
                                className="border rounded px-2 h-8 text-xs bg-white text-slate-700 w-28"
                                {...register(`slots.${idx}.start`, {
                                  required: true,
                                })}
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] opacity-70">
                                Fin
                              </span>
                              <input
                                type="time"
                                lang="fr-FR"
                                inputMode="numeric"
                                step={300}
                                className="border rounded px-2 h-8 text-xs bg-white text-slate-700 w-28"
                                {...register(`slots.${idx}.end`, {
                                  required: true,
                                  validate: (val) => {
                                    const start = getValues(
                                      `slots.${idx}.start`
                                    );
                                    return (
                                      timeToMinutes(val) >
                                        timeToMinutes(start) || "Fin > Début"
                                    );
                                  },
                                })}
                              />
                            </div>
                          </div>

                          {/* Sélecteur de label */}
                          <Controller
                            control={control}
                            name={`slots.${idx}.label`}
                            defaultValue={selected}
                            render={({ field }) => (
                              <select
                                {...field}
                                className="border rounded px-2 py-1 bg-white text-slate-700 w-full text-sm"
                              >
                                <option value="INBOUND">
                                  {labelPretty.INBOUND}
                                </option>
                                <option value="OUTBOUND">
                                  {labelPretty.OUTBOUND}
                                </option>
                                <option value="EMAILING">
                                  {labelPretty.EMAILING}
                                </option>
                                <option value="CHAT">{labelPretty.CHAT}</option>
                                <option value="BREAK">
                                  {labelPretty.BREAK}
                                </option>
                                <option value="LUNCH">
                                  {labelPretty.LUNCH}
                                </option>
                              </select>
                            )}
                          />
                        </div>

                        <input
                          type="hidden"
                          {...register(`slots.${idx}.day`)}
                        />
                      </div>
                    );
                  })}

                  {group.length === 0 && (
                    <div className="text-xs text-slate-400 italic mt-1">
                      Aucun créneau
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => addRow(day)}
                    className="mt-auto text-xs rounded-md border px-2 py-1 hover:bg-slate-50"
                  >
                    + Ajouter un créneau
                  </button>
                </div>
              );
            })}
          </div>

          {/* Légende */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-medium text-slate-600">Légende :</span>
            {(
              [
                "INBOUND",
                "OUTBOUND",
                "EMAILING",
                "CHAT",
                "BREAK",
                "LUNCH",
              ] as ApiLabel[]
            ).map((lab) => (
              <span
                key={lab}
                className={clsx("rounded px-2 py-1 ring-1", labelColors[lab])}
              >
                {labelPretty[lab]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
