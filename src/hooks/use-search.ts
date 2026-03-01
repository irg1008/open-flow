import { useReactQuery } from "@/lib/react-query";
import { keepPreviousData, UndefinedInitialDataOptions } from "@tanstack/react-query";
import { useState } from "react";
import { useDebounce } from "use-debounce";

type UseAsyncSearchOptions<TData> = {
  debounceMs?: number;
  searchKey: string;
  searchFn: (query: string) => Promise<TData[]>;
} & Omit<UndefinedInitialDataOptions<TData[], unknown, TData[]>, "queryKey" | "queryFn">;

export function useSearch<TData>({
  searchFn,
  searchKey,
  debounceMs = 500,
  retryDelay = 20_000,
  staleTime = 2 * 60_000,
  ...options
}: UseAsyncSearchOptions<TData>) {
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();

  const [debounceQuery] = useDebounce(trimmedQuery, debounceMs);
  const isDebouncing = debounceQuery !== trimmedQuery;

  const queryResult = useReactQuery({
    ...options,
    retryDelay,
    staleTime,
    queryKey: [searchKey, debounceQuery],
    enabled: !!debounceQuery,
    queryFn: () => searchFn(debounceQuery),
    select: (data) => (query ? data : []),
    placeholderData: keepPreviousData
  });

  return {
    ...queryResult,
    isLoading: queryResult.isLoading || isDebouncing,
    query,
    debounceQuery,
    setQuery
  };
}

export type UseSearchResult<TData> = ReturnType<typeof useSearch<TData>>;
