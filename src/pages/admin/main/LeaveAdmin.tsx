import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get } from "@/hooks/fecthing/get";
import { patch } from "@/hooks/fecthing/patch";
import { toast } from "sonner";
import clsx from "clsx";
import { CheckCheck, ChevronLeft, ChevronRight, X } from "lucide-react";

type Status = "PENDING" | "ACCEPTED" | "REJECTED";
type Person = { id: number; name: string; email: string };
type Leave = {
  id: number;
  status: Status;
  reason: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string | null;
  accountId: number;
  adminValidator: number | null;
  account: Person;
  admin: Person | null;
};
type FilterType = "NONE" | "SEARCH" | "REQUEST_DATE" | "PERIOD";
type LeavesPaged = { data: Leave[]; total: number };

const PAGE_SIZE = 10;

const statusPill: Record<Status, string> = {
  PENDING: "bg-amber-100 text-amber-800 ring-amber-200",
  ACCEPTED: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  REJECTED: "bg-rose-100 text-rose-800 ring-rose-200",
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

const overlaps = (s1?: Date, e1?: Date, s2?: Date, e2?: Date) => {
  if (!s2 && !e2) return true;
  if (s2 && e1 && e1 < s2) return false;
  if (e2 && s1 && s1 > e2) return false;
  return true;
};

const initialOf = (name?: string) =>
  name?.trim()?.charAt(0)?.toUpperCase() ?? "?";

export default function LeaveAdmin() {
  const qc = useQueryClient();

  // Filtres
  const [filterType, setFilterType] = useState<FilterType>("NONE");
  const [q, setQ] = useState("");
  const [reqStart, setReqStart] = useState("");
  const [reqEnd, setReqEnd] = useState("");
  const [perStart, setPerStart] = useState("");
  const [perEnd, setPerEnd] = useState("");

  // Pagination (serveur)
  const [page, setPage] = useState(1);

  const { data: api, isFetching } = useQuery<LeavesPaged>({
    queryKey: ["leaves-admin", page],
    queryFn: () => get<LeavesPaged>(`leave?page=${page}`),
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const rows = api?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((api?.total ?? 0) / PAGE_SIZE));

  // ---- Mutation: update status (PATCH leave/one) ----
  const updateStatus = useMutation({
    mutationFn: (payload: { id: number; status: Status }) =>
      patch<Leave, { id: number; status: Status }>("leave/one", payload),

    // Optimistic UI (maj immédiate du cache), rollback si erreur
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ["leaves-admin", page] });
      const previous = qc.getQueryData<LeavesPaged>(["leaves-admin", page]);

      qc.setQueryData<LeavesPaged>(["leaves-admin", page], (old) =>
        old
          ? {
              ...old,
              data: old.data.map((l) =>
                l.id === payload.id ? { ...l, status: payload.status } : l
              ),
            }
          : old
      );

      return { previous };
    },

    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(["leaves-admin", page], ctx.previous);
      }
      toast.error("Erreur lors de la mise à jour du statut");
    },

    onSuccess: () => {
      toast.success("Statut mis à jour avec succès");
    },

    // Optionnel: re-sync serveur
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["leaves-admin", page] });
    },
  });

  // Filtres (sur la page courante)
  const filtered = useMemo(() => {
    let r = rows;

    if (filterType === "SEARCH" && q.trim().length > 0) {
      const s = q.trim().toLowerCase();
      r = r.filter(
        (x) =>
          x.account.name.toLowerCase().includes(s) ||
          x.account.email.toLowerCase().includes(s)
      );
    }

    if (filterType === "REQUEST_DATE") {
      const s = reqStart ? new Date(reqStart) : undefined;
      const e = reqEnd ? new Date(reqEnd) : undefined;
      r = r.filter((x) => {
        const d = new Date(x.createdAt);
        if (s && d < s) return false;
        if (e && d > e) return false;
        return true;
      });
    }

    if (filterType === "PERIOD") {
      const s = perStart ? new Date(perStart) : undefined;
      const e = perEnd ? new Date(perEnd) : undefined;
      r = r.filter((x) =>
        overlaps(new Date(x.startDate), new Date(x.endDate), s, e)
      );
    }

    return r;
  }, [rows, filterType, q, reqStart, reqEnd, perStart, perEnd]);

  const resetPage = () => setPage(1);

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Demandes de congé</h2>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label className="text-sm text-gray-600 block mb-1">
            Type de filtre
          </label>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as FilterType);
              resetPage();
            }}
            className="border px-3 py-2 rounded-md text-sm"
          >
            <option value="NONE">Aucun</option>
            <option value="SEARCH">Recherche (nom / email)</option>
            <option value="REQUEST_DATE">Date de demande</option>
            <option value="PERIOD">Période de congé</option>
          </select>
        </div>

        {filterType === "SEARCH" && (
          <div className="w-64">
            <label className="text-sm text-gray-600 block mb-1">
              Nom ou email
            </label>
            <input
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                resetPage();
              }}
              placeholder="Ex: lou ou lou@email.com"
              className="border px-3 py-2 rounded-md text-sm w-full"
            />
          </div>
        )}

        {filterType === "REQUEST_DATE" && (
          <>
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Du (créée le)
              </label>
              <input
                type="date"
                value={reqStart}
                onChange={(e) => {
                  setReqStart(e.target.value);
                  resetPage();
                }}
                className="border px-3 py-2 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Au</label>
              <input
                type="date"
                value={reqEnd}
                onChange={(e) => {
                  setReqEnd(e.target.value);
                  resetPage();
                }}
                className="border px-3 py-2 rounded-md text-sm"
              />
            </div>
          </>
        )}

        {filterType === "PERIOD" && (
          <>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Début</label>
              <input
                type="date"
                value={perStart}
                onChange={(e) => {
                  setPerStart(e.target.value);
                  resetPage();
                }}
                className="border px-3 py-2 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Fin</label>
              <input
                type="date"
                value={perEnd}
                onChange={(e) => {
                  setPerEnd(e.target.value);
                  resetPage();
                }}
                className="border px-3 py-2 rounded-md text-sm"
              />
            </div>
          </>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3">Demandeur</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Période</th>
              <th className="p-3">Motif</th>
              <th className="p-3">Demandée le</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const disableAccept =
                updateStatus.isPending || row.status === "ACCEPTED";
              const disableReject =
                updateStatus.isPending || row.status === "REJECTED";

              return (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200 grid place-items-center font-semibold text-slate-700">
                        {initialOf(row.account.name)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">
                          {row.account.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {row.account.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={clsx(
                        "px-2 py-1 rounded-full text-xs font-semibold ring-1",
                        statusPill[row.status]
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {fmtDate(row.startDate)} → {fmtDate(row.endDate)}
                  </td>
                  <td className="p-3">{row.reason}</td>
                  <td className="p-3">{fmtDate(row.createdAt)}</td>
                  <td className="p-3 text-right space-x-3">
                    <button
                      className={clsx(
                        "text-gray-500 hover:text-emerald-600 disabled:opacity-50",
                        disableAccept && "cursor-not-allowed"
                      )}
                      disabled={disableAccept}
                      onClick={() =>
                        updateStatus.mutate({ id: row.id, status: "ACCEPTED" })
                      }
                      title="Accepter"
                    >
                      <CheckCheck size={16} />
                    </button>
                    <button
                      className={clsx(
                        "text-gray-500 hover:text-rose-600 disabled:opacity-50",
                        disableReject && "cursor-not-allowed"
                      )}
                      disabled={disableReject}
                      onClick={() =>
                        updateStatus.mutate({ id: row.id, status: "REJECTED" })
                      }
                      title="Rejeter"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  {isFetching ? "Chargement..." : "Aucun résultat."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (serveur) */}
      <div className="mt-4 flex justify-between items-center text-sm">
        <div>
          Page {page} / {totalPages}
        </div>
        <div className="flex gap-1">
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft />
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={clsx(
                "px-3 py-1 rounded border",
                page === i + 1 ? "bg-gray-700 text-white" : "hover:bg-gray-100"
              )}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
