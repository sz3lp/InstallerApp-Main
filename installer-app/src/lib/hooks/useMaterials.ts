import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface Material {
  id: string;
  name: string;
}

export default function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from<Material>("materials")
      .select("id, name")
      .order("name", { ascending: true });
    if (error) {
      setError(error.message);
      setMaterials([]);
    } else {
      setError(null);
      setMaterials(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  return { materials, loading, error, refresh: fetchMaterials } as const;
}
