import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

export interface SalesRep {
  id: string;
  email: string | null;
}

export default function useSalesReps() {
  const [reps, setReps] = useState<SalesRep[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, users(email)")
        .eq("role", "Sales");
      if (error) {
        setError(error.message);
        setReps([]);
      } else {
        const mapped = (data ?? []).map((r: any) => ({
          id: r.user_id,
          email: r.users?.email ?? null,
        }));
        setReps(mapped);
        setError(null);
      }
      setLoading(false);
    }
    load();
  }, []);

  return { reps, loading, error } as const;
}
