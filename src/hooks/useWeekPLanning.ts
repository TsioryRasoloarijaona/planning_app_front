import { useQuery } from "@tanstack/react-query";
import { get } from "@/hooks/fecthing/get";
import type { ApiWeek } from "@/types/planning";

export function useWeekPlanning(selectedWeek: string) {
  const q = useQuery<ApiWeek>({
    queryKey: ["planning", selectedWeek],
    queryFn: () => get<ApiWeek>(`planning/${selectedWeek}`),
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  return {
    apiWeek: q.data,
    isFetching: q.isFetching,
  };
}
