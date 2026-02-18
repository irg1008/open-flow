import { useReactQuery } from "@/lib/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { useDebounce } from "use-debounce";

type UseAsyncSearchOptions<TData> = {
  debounceMs?: number;
  retryDelay?: number;
  searchKey: string;
  searchFn: (query: string) => Promise<TData[]>;
};

export function useSearch<TData>({
  debounceMs = 500,
  retryDelay = 20_000,
  searchFn,
  searchKey
}: UseAsyncSearchOptions<TData>) {
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();

  const [debounceQuery] = useDebounce(trimmedQuery, debounceMs);
  const isDebouncing = debounceQuery !== trimmedQuery;

  const queryResult = useReactQuery({
    queryKey: [searchKey, debounceQuery],
    enabled: !!debounceQuery,
    retryDelay: retryDelay,
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
