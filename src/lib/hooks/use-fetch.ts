"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseFetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isRefetching: boolean;
}

export interface UseFetchResult<T> extends UseFetchState<T> {
  refetch: () => Promise<void>;
  setData: (updater: T | ((prev: T | null) => T)) => void;
}

interface UseFetchOptions<T> {
  /** Fallback to use when the fetcher fails (e.g. backend not yet wired). */
  fallback?: T;
  /** Skip fetching until ready (e.g. waiting on auth). */
  enabled?: boolean;
  /**
   * Stable cache key. The fetcher will re-run whenever this changes.
   * Defaults to a constant — pass an explicit key for parameterized fetches.
   */
  cacheKey?: string;
}

/**
 * Tiny fetcher hook. We intentionally do NOT pull in TanStack Query — for an
 * MVP this covers loading / error / refetch and that is all the tabs need.
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions<T> = {},
): UseFetchResult<T> {
  const { fallback, enabled = true, cacheKey = "default" } = options;
  const [state, setState] = useState<UseFetchState<T>>({
    data: fallback ?? null,
    error: null,
    isLoading: enabled,
    isRefetching: false,
  });
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(
    async (isRefetch: boolean) => {
      if (!enabled) return;
      const id = ++requestIdRef.current;
      setState((prev) => ({
        ...prev,
        isLoading: !isRefetch && prev.data === null,
        isRefetching: isRefetch,
        error: null,
      }));
      try {
        const data = await fetcherRef.current();
        if (!mountedRef.current || id !== requestIdRef.current) return;
        setState({ data, error: null, isLoading: false, isRefetching: false });
      } catch (err) {
        if (!mountedRef.current || id !== requestIdRef.current) return;
        const error = err instanceof Error ? err : new Error("Unknown error");
        setState((prev) => ({
          data: prev.data ?? fallback ?? null,
          error,
          isLoading: false,
          isRefetching: false,
        }));
      }
    },
    [enabled, fallback],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run(false);
    // re-run when consumer asks us to (cacheKey/enabled change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, cacheKey]);

  const refetch = useCallback(() => run(true), [run]);
  const setData = useCallback<UseFetchResult<T>["setData"]>((updater) => {
    setState((prev) => ({
      ...prev,
      data:
        typeof updater === "function"
          ? (updater as (p: T | null) => T)(prev.data)
          : updater,
    }));
  }, []);

  return { ...state, refetch, setData };
}



