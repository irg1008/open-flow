import { type UseAsyncSearchReturn, useAsyncSearch } from "@/hooks/use-async-search";
import { createContext, useContext } from "react";

type AsyncSearchRootProps<TData> = {
  action: (query: string) => Promise<TData[]>;
  debounceMs?: number;
  children: React.ReactNode;
};

type AsyncSearchContextValue = UseAsyncSearchReturn<unknown>;

const AsyncSearchContext = createContext<AsyncSearchContextValue | null>(null);

function useAsyncSearchContext<TData>() {
  const context = useContext(AsyncSearchContext);

  if (!context) {
    throw new Error("AsyncSearch components must be used inside <AsyncSearch>");
  }

  return context as UseAsyncSearchReturn<TData>;
}

export function AsyncSearchRoot<TData>({
  action,
  debounceMs,
  children
}: AsyncSearchRootProps<TData>) {
  const search = useAsyncSearch(action, { debounceMs });

  return (
    <AsyncSearchContext.Provider value={search as AsyncSearchContextValue}>
      {children}
    </AsyncSearchContext.Provider>
  );
}

export function AsyncSearchSearch<TData>({
  children
}: {
  children: (props: Pick<UseAsyncSearchReturn<TData>, "query" | "setQuery">) => React.ReactNode;
}) {
  const { query, setQuery } = useAsyncSearchContext<TData>();
  return <>{children({ query, setQuery })}</>;
}

export function AsyncSearchError<TData>({
  children
}: {
  children: (message: string) => React.ReactNode;
}) {
  const { error } = useAsyncSearchContext<TData>();

  if (!error) {
    return null;
  }

  return <>{children(error)}</>;
}

export function AsyncSearchLoading<TData>({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error } = useAsyncSearchContext<TData>();

  if (data || !isLoading || error) {
    return null;
  }

  return <>{children}</>;
}

export function AsyncSearchPlaceholder<TData>({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useAsyncSearchContext<TData>();

  if (data || isLoading) {
    return null;
  }

  return <>{children}</>;
}

export function AsyncSearchEmpty<TData>({ children }: { children: React.ReactNode }) {
  const { data } = useAsyncSearchContext<TData>();

  if (!data || data.length !== 0) {
    return null;
  }

  return <>{children}</>;
}

export function AsyncSearchResults<TData>({
  children
}: {
  children: (data: TData[]) => React.ReactNode;
}) {
  const { data } = useAsyncSearchContext<TData>();

  if (!data || data.length === 0) {
    return null;
  }

  return <>{children(data as TData[])}</>;
}

export function AsyncSearchLegacy<TData>({
  searchFn,
  children,
  debounceMs = 300,
  placeholder: Placeholder,
  search: Search,
  empty: SearchEmpty,
  loading: Loading,
  error: Error
}: {
  searchFn: (query: string) => Promise<TData[]>;
  children: (data: TData[]) => React.ReactNode;
  debounceMs?: number;
  placeholder?: React.ComponentType;
  search?: React.ComponentType<Pick<UseAsyncSearchReturn<TData>, "query" | "setQuery">>;
  empty?: React.ComponentType;
  loading?: React.ComponentType;
  error?: React.ComponentType<{ message: string }>;
}) {
  const { data, isLoading, query, error, setQuery } = useAsyncSearch(searchFn, { debounceMs });

  return (
    <>
      {Search && <Search query={query} setQuery={setQuery} />}

      {error && Error && <Error message={error} />}

      {!data && isLoading && Loading && <Loading />}
      {!data && !isLoading && Placeholder && <Placeholder />}

      {data && data.length === 0 && SearchEmpty && <SearchEmpty />}
      {data && data.length > 0 && children(data)}
    </>
  );
}
