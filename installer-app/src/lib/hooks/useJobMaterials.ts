import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface JobMaterial {
  id: string;
  job_id: string;
  material_id: string;
  quantity: number;
  used_quantity: number;
}

export function useJobMaterials(jobId: string) {
  const [items, setItems] = useState<JobMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from<JobMaterial>("job_materials")
      .select("id, job_id, material_id, quantity, used_quantity")
      .eq("job_id", jobId);
    if (error) {
      setError(error.message);
      setItems([]);
    } else {
      setItems(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [jobId]);

  const updateUsed = useCallback(async (id: string, used_quantity: number) => {
    const { data, error } = await supabase
      .from<JobMaterial>("job_materials")
      .update({ used_quantity })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setItems((is) => is.map((i) => (i.id === id ? data : i)));
    return data;
  }, []);

  const addMaterial = useCallback(
    async (material_id: string, quantity: number) => {
      if (!jobId) throw new Error("Missing job id");
      const { data, error } = await supabase
        .from<JobMaterial>("job_materials")
        .insert({ job_id: jobId, material_id, quantity })
        .select()
        .single();
      if (error) throw error;
      setItems((is) => [...is, data]);
      return data;
    },
    [jobId],
  );

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    fetchItems,
    updateUsed,
    addMaterial,
  } as const;
}

export default useJobMaterials;
