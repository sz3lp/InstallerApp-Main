import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface MaterialType {
  id: string;
  name: string;
  unit_of_measure: string;
  default_cost: number | null;
  retail_price: number | null;
  created_at: string;
}

export default function useMaterialTypes() {
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from<MaterialType>("materials")
      .select(
        "id, name, unit_of_measure, default_cost, retail_price, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      setMaterials([]);
    } else {
      setError(null);
      setMaterials(data ?? []);
    }
    setLoading(false);
  }, []);

  const createMaterial = useCallback(
    async (input: Omit<MaterialType, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from<MaterialType>("materials")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      setMaterials((list) => [data, ...list]);
      return data;
    },
    [],
  );

  const updateMaterial = useCallback(
    async (id: string, input: Omit<MaterialType, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from<MaterialType>("materials")
        .update(input)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setMaterials((list) => list.map((m) => (m.id === id ? data : m)));
      return data;
    },
    [],
  );

  const deleteMaterial = useCallback(async (id: string) => {
    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (error) throw error;
    setMaterials((list) => list.filter((m) => m.id !== id));
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  return {
    materials,
    loading,
    error,
    fetchMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  } as const;
}
