import { useCallback, useState } from 'react';

export function useRequest<T, TArgs extends unknown[]>(request: (...args: TArgs) => Promise<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const run = useCallback(async (...args: TArgs) => {
    setLoading(true);
    setError(null);
    try { return await request(...args); } catch (caught) { const nextError = caught instanceof Error ? caught : new Error('Request failed'); setError(nextError); throw nextError; } finally { setLoading(false); }
  }, [request]);
  return { run, loading, error };
}
