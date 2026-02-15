import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

type UseAsyncSearchOptions = {
  debounceMs?: number;
};

export function useAsyncSearch<TData>(
  searchFn: (query: string) => Promise<TData[]>,
  options?: UseAsyncSearchOptions
) {
  const debounceMs = options?.debounceMs ?? 300;

  const [query, setQuery] = useState("");
  const [data, setData] = useState<TData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const trimmedQuery = query.trim();
  const [debouncedQuery] = useDebounce(trimmedQuery, debounceMs);

  const hasQuery = Boolean(trimmedQuery);
  const isLoading = hasQuery && (debouncedQuery !== trimmedQuery || data === null);

  useEffect(() => {
    setError(null);

    if (!debouncedQuery) {
      setData(null);
      return;
    }

    searchFn(debouncedQuery)
      .then(setData)
      .catch((caughtError: unknown) => {
        if (caughtError instanceof Error) {
          setError(caughtError.message);
          return;
        }

        setError(String(caughtError));
      });
  }, [debouncedQuery, searchFn]);

  const updateQuery = (value: string) => {
    if (!value.trim()) {
      setData(null);
      setError(null);
    }

    setQuery(value);
  };

  return {
    data,
    isLoading,
    query,
    hasQuery,
    error,
    setQuery: updateQuery
  };
}

export type UseAsyncSearchReturn<TData> = ReturnType<typeof useAsyncSearch<TData>>;
