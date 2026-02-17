import { useEffect, useState } from "react";

export const useAsync = <TData, TArgs extends unknown[]>(
  asyncFn: (...args: TArgs) => Promise<TData>,
  ...args: TArgs
) => {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await asyncFn(...args);
        setData(result);
      } catch (caughtError: unknown) {
        if (caughtError instanceof Error) {
          setError(caughtError.message);
          return;
        }
        setError(String(caughtError));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
  }, args);

  return { data, error, isLoading };
};
