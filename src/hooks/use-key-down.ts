import { useCallback, useEffect } from "react";

export const useKeyDown = (
  key: string | ((event: KeyboardEvent) => boolean),
  callback: () => void
) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMatch = typeof key === "string" ? e.key === key : key(e);
      if (!isMatch) return;

      e.preventDefault();
      callback();
    },
    [key, callback]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
};
