import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Pencil, Trash } from "lucide-react";
import clsx from "clsx";
import type { Account } from "@/interfaces/LoginRes";
import { get } from "@/hooks/fecthing/get";
import { useQuery } from "@tanstack/react-query";
import { AGENTS_QUERY_KEY } from "@/queries/queryKey";
import NewAgent from "@/components/NewAgent";

type AgentsPaged = { data: Array<Account>; total: number };

const PAGE_SIZE = 10;

const roleColors: Record<"ADMIN" | "EMPLOYEE", string> = {
  ADMIN: "bg-green-100 text-green-800",
  EMPLOYEE: "bg-purple-100 text-purple-800",
};

/* ========= Helpers pagination ========= */
function range(start: number, end: number) {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
  boundaryCount = 3
): Array<number | "..."> {
  const totalNumbers = siblingCount * 2 + 3 + boundaryCount * 2; 
  if (totalPages <= totalNumbers) {
    return range(1, totalPages);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSibling > boundaryCount + 2;
  const showRightDots = rightSibling < totalPages - boundaryCount - 1;

  const firstPages = range(1, boundaryCount);
  const lastPages = range(totalPages - boundaryCount + 1, totalPages);

  let middleStart = leftSibling;
  let middleEnd = rightSibling;

  // Empêche les overlaps avec les blocs de tête/queue
  if (!showLeftDots) {
    middleStart = boundaryCount + 1;
  }
  if (!showRightDots) {
    middleEnd = totalPages - boundaryCount;
  }

  const middlePages = range(middleStart, middleEnd);

  const items: Array<number | "..."> = [
    ...firstPages,
    showLeftDots ? "..." : undefined,
    ...middlePages,
    showRightDots ? "..." : undefined,
    ...lastPages,
  ].filter(Boolean) as Array<number | "...">;

  return items;
}

export default function UserTable() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState(search);
  const [currentPage, setCurrentPage] = useState(1);

  const prevRowsRef = useRef<Account[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const isSearching = debounced.length > 0;

  // Liste paginée (active uniquement quand pas de recherche)
  const { data: listData, isFetching: isFetchingList } = useQuery<AgentsPaged>({
    queryKey: [...AGENTS_QUERY_KEY, "list", currentPage],
    queryFn: () => get<AgentsPaged>(`account?page=${currentPage}`),
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: !isSearching,
  });

  // Résultat filtré (sans pagination) — active uniquement en mode recherche
  const { data: filterData, isFetching: isFetchingFilter } = useQuery<
    Account[]
  >({
    queryKey: [...AGENTS_QUERY_KEY, "filter", debounced],
    queryFn: () =>
      get<Account[]>(`account/filter?filter=${encodeURIComponent(debounced)}`),
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: isSearching,
  });

  const newRows: Account[] = isSearching
    ? filterData ?? []
    : listData?.data ?? [];

  useEffect(() => {
    if (newRows && newRows.length >= 0) {
      prevRowsRef.current = newRows;
    }
  }, [isSearching, listData, filterData]);

  const displayRows: Account[] = isSearching
    ? filterData ?? prevRowsRef.current
    : listData?.data ?? prevRowsRef.current;

  const totalPages = isSearching
    ? 1
    : Math.max(1, Math.ceil((listData?.total ?? 0) / PAGE_SIZE));
  const isFetching = isSearching ? isFetchingFilter : isFetchingList;

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const paginationItems = getPaginationRange(currentPage, totalPages, 1, 3);

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Liste des utilisateurs</h2>

      {/* Recherche serveur */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="w-full max-w-sm">
          <label className="text-sm text-gray-600 block mb-1">
            Rechercher (nom ou email)
          </label>
          <input
            type="text"
            placeholder="Ex: tsiory ou tsiory@mail.com"
            className="border px-3 py-2 rounded-md text-sm w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isSearching && (
            <p className="text-xs text-gray-500 mt-1">
              Recherche active — pagination désactivée
            </p>
          )}
        </div>
        <NewAgent />
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3">id</th>
              <th className="p-3">Nom</th>
              <th className="p-3">Email</th>
              <th className="p-3">Rôle</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{user.id}</td>
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <span
                    className={clsx(
                      "px-2 py-1 rounded-full text-xs font-semibold ring-1",
                      roleColors[user.role as "ADMIN" | "EMPLOYEE"] ??
                        "bg-gray-100 text-gray-700"
                    )}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-3 text-right space-x-3">
                  <button className="text-gray-500 hover:text-blue-600">
                    <Pencil size={16} />
                  </button>
                  <button className="text-gray-500 hover:text-red-600">
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {displayRows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  {isFetching ? "Chargement..." : "Aucun utilisateur trouvé."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination visible uniquement hors recherche */}
      {!isSearching && (
        <div className="mt-4 flex justify-between items-center text-sm">
          <div>
            Page {currentPage} sur {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Page précédente"
              title="Page précédente"
            >
              <ChevronLeft />
            </button>

            {paginationItems.map((item, idx) =>
              item === "..." ? (
                <span
                  key={`dots-${idx}`}
                  className="px-3 py-1 text-gray-500 select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => goToPage(item)}
                  className={clsx(
                    "px-3 py-1 rounded border",
                    currentPage === item
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-100"
                  )}
                >
                  {item}
                </button>
              )
            )}

            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Page suivante"
              title="Page suivante"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
