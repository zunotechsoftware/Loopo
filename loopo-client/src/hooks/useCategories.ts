import { useState, useEffect, useCallback } from 'react';
import { productsApi } from '@/services/productsApi';

export interface RealCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  itemCount: number;
}

/**
 * Fetches the real top-level categories from the backend (GET /categories).
 *
 * Replaces the previously hardcoded `CATEGORIES` constant (src/types) that
 * several screens used to render category lists with a fake, always-zero
 * item count, and — more seriously — that the sell flow used to resolve a
 * category *name* to a stale, hardcoded category *id* that no longer exists
 * after any reseed, breaking listing creation entirely (404 "Category not
 * found"). Category ids from here are real, current, and safe to submit.
 */
export function useCategories() {
  const [categories, setCategories] = useState<RealCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productsApi.getCategories();
      if (res.success) {
        setCategories(res.data ?? []);
      } else {
        setError(res.error || 'Could not load categories.');
      }
    } catch (err) {
      console.error('Failed to load categories', err);
      setError('Could not load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { categories, loading, error, reload: load };
}
