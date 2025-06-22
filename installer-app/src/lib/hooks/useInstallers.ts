import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface Installer {
  id: string;
  full_name: string | null;
}

export function useInstallers() {
  const [installers, setInstallers] = useState<Installer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstallers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name")
      .ilike("role", "installer");
    if (error) {
      setError(error.message);
      setInstallers([]);
    } else {
      const mapped = (data ?? []).map((row: any) => ({
        id: row.id,
        full_name: row.full_name ?? null,
      }));
      setInstallers(mapped);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInstallers();
  }, [fetchInstallers]);

  return { installers, loading, error, fetchInstallers } as const;
}

export default useInstallers;
