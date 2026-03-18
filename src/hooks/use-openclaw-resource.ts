import { useCallback, useEffect, useState } from "react";

type ResourceStatus = "idle" | "loading" | "success" | "error";

export type UseOpenClawResourceResult<T> = {
  status: ResourceStatus;
  data: T | null;
  error: string | null;
  refresh: () => void;
};

export function useOpenClawResource<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseOpenClawResourceResult<T> {
  const [state, setState] = useState<ResourceStatus>("idle");
  const [payload, setPayload] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((prev) => prev + 1), []);

  useEffect(() => {
    let canceled = false;
    setState("loading");
    setPayload(null);
    setError(null);

    fetcher()
      .then((result) => {
        if (canceled) return;
        setPayload(result);
        setState("success");
      })
      .catch((err) => {
        if (canceled) return;
        setError(err?.message ?? "Unable to load data.");
        setState("error");
      });

    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, ...deps]);

  return {
    status: state,
    data: payload,
    error,
    refresh,
  };
}
