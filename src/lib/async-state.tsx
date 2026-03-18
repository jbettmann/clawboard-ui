"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  status: AsyncStatus;
  data?: T;
  error?: Error;
}

export interface AsyncResource<T> extends AsyncState<T> {
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  reload: () => Promise<void>;
  reset: () => void;
}

export type AsyncLoader<T> = (signal: AbortSignal) => Promise<T>;

export interface AsyncResourceOptions {
  autoStart?: boolean;
}

function normalizeError(value: unknown) {
  if (value instanceof Error) {
    return value;
  }
  if (typeof value === "string") {
    return new Error(value);
  }
  return new Error("Unknown async error");
}

export function useAsyncResource<T>(
  loader: AsyncLoader<T>,
  options?: AsyncResourceOptions,
): AsyncResource<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: "idle" });
  const controllerRef = useRef<AbortController | null>(null);
  const autoStart = options?.autoStart ?? true;

  const run = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState((prev) => ({ status: "loading", data: prev.data, error: undefined }));

    try {
      const data = await loader(controller.signal);
      if (controller.signal.aborted) {
        return;
      }
      setState({ status: "success", data, error: undefined });
    } catch (value) {
      if (controller.signal.aborted) {
        return;
      }
      const error = normalizeError(value);
      setState({ status: "error", data: undefined, error });
      throw error;
    }
  }, [loader]);

  useEffect(() => {
    if (!autoStart) {
      return () => {
        controllerRef.current?.abort();
      };
    }

    const timer = setTimeout(() => {
      void run();
    }, 0);

    return () => {
      clearTimeout(timer);
      controllerRef.current?.abort();
    };
  }, [run, autoStart]);

  const resource: AsyncResource<T> = {
    ...state,
    isIdle: state.status === "idle",
    isLoading: state.status === "loading",
    isSuccess: state.status === "success",
    isError: state.status === "error",
    reload: run,
    reset: () => setState({ status: "idle", data: undefined, error: undefined }),
  };

  return resource;
}
