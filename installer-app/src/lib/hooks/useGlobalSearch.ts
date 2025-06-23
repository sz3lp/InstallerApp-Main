import { useCallback, useState } from 'react';
import supabase from '../supabaseClient';

export interface SearchResult {
  id: string;
  label: string;
  entity_type: string;
}

export default function useGlobalSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (term: string) => {
    if (!term) {
      setResults([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc('global_search_entities', {
      search_term: term,
    });
    if (error) {
      setError(error.message);
      setResults([]);
    } else {
      setError(null);
      setResults(data ?? []);
    }
    setLoading(false);
  }, []);

  return { results, loading, error, search } as const;
}
