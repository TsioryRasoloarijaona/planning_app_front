import LeaveForm from "@/components/LeaveForm";
import { Loader, X, CheckCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/hooks/fecthing/get";
import { type Leave } from "@/interfaces/LeaveInterface";
import { LEAVES_QUERY_KEY } from "@/queries/queryKey";

type FilterType = "NONE" | "LEAVE_PERIOD" | "STATUS" | "REQUEST_PERIOD";
type StatusType = "PENDING" | "ACCEPTED" | "REJECTED";

export default function Leave() {
  const fetchLeaves = async () => get<Leave[]>("leave/account");

  const { data: leaves = [] } = useQuery<Leave[]>({
    queryKey: LEAVES_QUERY_KEY,
    queryFn: fetchLeaves,
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const [filterType, setFilterType] = useState<FilterType>("NONE");
  const [leaveStart, setLeaveStart] = useState<string>("");
  const [leaveEnd, setLeaveEnd] = useState<string>("");
  const [status, setStatus] = useState<StatusType>("PENDING");
  const [reqStart, setReqStart] = useState<string>("");
  const [reqEnd, setReqEnd] = useState<string>("");
  const [applied, setApplied] = useState<number>(0);

  const applyFilters = () => setApplied((n) => n + 1);
  const resetFilters = () => {
    setFilterType("NONE");
    setLeaveStart("");
    setLeaveEnd("");
    setStatus("PENDING");
    setReqStart("");
    setReqEnd("");
    setApplied((n) => n + 1);
  };

  const inRange = (d: Date, start?: Date, end?: Date) => {
    if (!d) return false;
    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  };

  const filteredLeaves = useMemo(() => {
    if (filterType === "NONE") return leaves;

    if (filterType === "LEAVE_PERIOD") {
      const s = leaveStart ? new Date(leaveStart) : undefined;
      const e = leaveEnd ? new Date(leaveEnd) : undefined;
      return leaves.filter((lv) => {
        const start = new Date(lv.StartDate);
        const end = new Date(lv.EndDate);
        if (!s && !e) return true;
        if (s && end < s) return false;
        if (e && start > e) return false;
        return true;
      });
    }

    if (filterType === "STATUS") {
      return leaves.filter((lv) => lv.Status === status);
    }

    if (filterType === "REQUEST_PERIOD") {
      const s = reqStart ? new Date(reqStart) : undefined;
      const e = reqEnd ? new Date(reqEnd) : undefined;
      return leaves.filter((lv) => inRange(new Date(lv.createdAt), s, e));
    }

    return leaves;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    leaves,
    filterType,
    leaveStart,
    leaveEnd,
    status,
    reqStart,
    reqEnd,
    applied,
  ]);

  const formatDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString("fr-FR") : "_ _ _ _";

  const StatusBadge = ({ st }: { st: StatusType }) => {
    const base =
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ring-1";
    if (st === "PENDING") {
      return (
        <span className={`${base} bg-amber-50 text-amber-800 ring-amber-200`}>
          <Loader size={12} className="animate-spin" />
          EN ATTENTE
        </span>
      );
    }
    if (st === "ACCEPTED") {
      return (
        <span
          className={`${base} bg-emerald-50 text-emerald-800 ring-emerald-200`}
        >
          <CheckCheck size={12} />
          ACCEPTÉ
        </span>
      );
    }
    return (
      <span className={`${base} bg-rose-50 text-rose-800 ring-rose-200`}>
        <X size={12} />
        REJETÉ
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Filtres responsive */}
      <div className="mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
          {/* Type de filtre */}
          <div className="flex flex-col gap-1 min-w-[220px]">
            <label className="text-xs text-gray-600">Type de filtre</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="border px-3 py-2 rounded-md text-sm"
            >
              <option value="NONE">Aucun</option>
              <option value="LEAVE_PERIOD">
                Par période de congé (début/fin)
              </option>
              <option value="STATUS">Par statut</option>
              <option value="REQUEST_PERIOD">
                Par date de demande (création)
              </option>
            </select>
          </div>

          {/* LEAVE_PERIOD */}
          {filterType === "LEAVE_PERIOD" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Début du congé</label>
                <input
                  type="date"
                  className="border px-3 py-2 rounded-md text-sm"
                  value={leaveStart}
                  onChange={(e) => setLeaveStart(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Fin du congé</label>
                <input
                  type="date"
                  className="border px-3 py-2 rounded-md text-sm"
                  value={leaveEnd}
                  onChange={(e) => setLeaveEnd(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STATUS */}
          {filterType === "STATUS" && (
            <div className="flex flex-col gap-1 min-w-[200px]">
              <label className="text-xs text-gray-600">Statut</label>
              <select
                className="border px-3 py-2 rounded-md text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusType)}
              >
                <option value="PENDING">en traitement</option>
                <option value="ACCEPTED">accepté</option>
                <option value="REJECTED">refusé</option>
              </select>
            </div>
          )}

          {/* REQUEST_PERIOD */}
          {filterType === "REQUEST_PERIOD" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Demande du</label>
                <input
                  type="date"
                  className="border px-3 py-2 rounded-md text-sm"
                  value={reqStart}
                  onChange={(e) => setReqStart(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">au</label>
                <input
                  type="date"
                  className="border px-3 py-2 rounded-md text-sm"
                  value={reqEnd}
                  onChange={(e) => setReqEnd(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 md:ml-auto">
            <button
              onClick={applyFilters}
              className="px-3 py-2 rounded-md border bg-gray-700 text-white text-sm"
            >
              Appliquer
            </button>
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-md border text-sm"
            >
              Réinitialiser
            </button>
            <LeaveForm />
          </div>
        </div>
      </div>

      {/* ===== Desktop: Tableau ===== */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3">Début</th>
              <th className="p-3">Fin</th>
              <th className="p-3">Raison</th>
              <th className="p-3">Créée le</th>
              <th className="p-3">Mise à jour</th>
              <th className="p-3">Traité par</th>
              <th className="p-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.map((leave, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-3">{formatDate(leave.StartDate)}</td>
                <td className="p-3">{formatDate(leave.EndDate)}</td>
                <td className="p-3">{leave.Reason}</td>
                <td className="p-3">{formatDate(leave.createdAt)}</td>
                <td className="p-3">
                  {leave.updatedAt ? formatDate(leave.updatedAt) : "_ _ _ _"}
                </td>
                <td className="p-3">
                  {leave.admin ? leave.admin.name : "_ _ _ _"}
                </td>
                <td className="p-3">
                  <StatusBadge st={leave.Status as StatusType} />
                </td>
              </tr>
            ))}
            {filteredLeaves.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={7}>
                  Aucun résultat pour ce filtre.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Mobile: Cartes ===== */}
      <div className="md:hidden space-y-3">
        {filteredLeaves.length === 0 ? (
          <div className="p-6 text-center text-gray-500 border rounded-lg">
            Aucun résultat pour ce filtre.
          </div>
        ) : (
          filteredLeaves.map((leave, idx) => (
            <div key={idx} className="border rounded-lg p-3 shadow-sm bg-white">
              {/* Ligne d’entête: dates + statut */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm font-semibold text-slate-800">
                  {formatDate(leave.StartDate)} → {formatDate(leave.EndDate)}
                </div>
                <StatusBadge st={leave.Status as StatusType} />
              </div>

              {/* Détails */}
              <div className="mt-2 grid grid-cols-1 gap-1 text-[13px] text-slate-700">
                <div>
                  <span className="text-slate-500">Raison :</span>{" "}
                  <span className="font-medium">{leave.Reason}</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <span>
                    <span className="text-slate-500">Créée :</span>{" "}
                    {formatDate(leave.createdAt)}
                  </span>
                  <span>
                    <span className="text-slate-500">Mise à jour :</span>{" "}
                    {leave.updatedAt ? formatDate(leave.updatedAt) : "_ _ _ _"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Traité par :</span>{" "}
                  <span className="font-medium">
                    {leave.admin ? leave.admin.name : "_ _ _ _"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
