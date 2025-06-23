import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface Material {
  id: string;
  name: string;
  sku?: string | null;
  category?: string | null;
  base_cost?: number | null;
  default_sale_price?: number | null;
  default_pay_rate?: number | null;
  active?: boolean | null;
}

export default function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from<Material>("materials")
      .select(
        "id, name, sku, category, base_cost, default_sale_price, default_pay_rate, active",
      )
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

  const createMaterial = useCallback(async (material: Omit<Material, "id">) => {
    const { data, error } = await supabase
      .from<Material>("materials")
      .insert(material)
      .select()
      .single();
    if (error) throw error;
    setMaterials((ms) => [...ms, data]);
    return data;
  }, []);

  const updateMaterial = useCallback(
    async (id: string, material: Omit<Material, "id">) => {
      const { data, error } = await supabase
        .from<Material>("materials")
        .update(material)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setMaterials((ms) => ms.map((m) => (m.id === id ? data : m)));
      return data;
    },
    [],
  );

  const deactivateMaterial = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from<Material>("materials")
      .update({ active: false })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setMaterials((ms) => ms.map((m) => (m.id === id ? data : m)));
    return data;
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
    deactivateMaterial,
  } as const;
}
