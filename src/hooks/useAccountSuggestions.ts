import { useEffect, useState } from "react";
import { get } from "@/hooks/fecthing/get";
import type { Account } from "@/interfaces/LoginRes";

type State =
  | { loading: true; error: null; suggestions: Account[] }
  | { loading: false; error: string | null; suggestions: Account[] };

export function useAccountSuggestions(query: string, delay = 300) {
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
    suggestions: [],
  });

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setState({ loading: false, error: null, suggestions: [] });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));

    const id = setTimeout(async () => {
      try {
        const res = await get<Account[]>(
          `account/filter?filter=${encodeURIComponent(q)}`
        );
        setState({ loading: false, error: null, suggestions: res ?? [] });
      } catch (e: any) {
        setState({ loading: false, error: e?.message ?? "Erreur de chargement", suggestions: [] });
      }
    }, delay);

    return () => clearTimeout(id);
  }, [query, delay]);

  return state; // { loading, error, suggestions }
}
