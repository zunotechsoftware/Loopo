'use client';

import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Generic hook for managing API call state with loading and error handling
 */
export function useApi<T>(
  apiFn: (...args: any[]) => Promise<{ data: T }>
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await apiFn(...args);
        setState({ data: response.data, loading: false, error: null });
        return response.data;
      } catch (err) {
        const error = err as AxiosError<{ message: string }>;
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        setState({ data: null, loading: false, error: errorMessage });
        throw error;
      }
    },
    [apiFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

/**
 * Hook for pagination state management
 */
export function usePagination(initialPage = 1, initialLimit = 20) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const goToPage = (p: number) => setPage(p);
  const changeLimit = (l: number) => {
    setLimit(l);
    setPage(1);
  };

  return { page, limit, nextPage, prevPage, goToPage, changeLimit };
}

/**
 * Hook to manage dialog state (open/close)
 */
export function useDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((v) => !v);
  return { isOpen, open, close, toggle };
}

/**
 * Hook for confirmation dialogs
 */
export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const confirm = (action: () => void) => {
    setPendingAction(() => action);
    setIsOpen(true);
  };

  const accept = () => {
    pendingAction?.();
    setIsOpen(false);
    setPendingAction(null);
  };

  const cancel = () => {
    setIsOpen(false);
    setPendingAction(null);
  };

  return { isOpen, confirm, accept, cancel };
}
