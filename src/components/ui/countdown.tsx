import { useEffect, useState } from "react";
import { clearInterval, setInterval } from "worker-timers";

type CountdownProps = {
  ms?: number;
  active?: boolean;
  children: (remainingMs: number) => React.ReactNode;
};

const normalizeMs = (ms?: number) => Math.max(0, ms ?? 0);

export function Countdown({ ms, active = true, children }: CountdownProps) {
  const [remainingMs, setRemainingMs] = useState(normalizeMs(ms));

  useEffect(() => {
    setRemainingMs(normalizeMs(ms));
  }, [ms]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const totalMs = normalizeMs(ms);
    const endAt = Date.now() + totalMs;

    const updateRemaining = () => {
      const next = normalizeMs(endAt - Date.now());
      setRemainingMs(next);
    };

    updateRemaining();
    const intervalId = setInterval(updateRemaining, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [active, ms]);

  return <>{children(remainingMs)}</>;
}
