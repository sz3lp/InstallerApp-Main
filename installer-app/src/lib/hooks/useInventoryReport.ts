import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

export interface InventoryRow {
  material_type_id: string;
  material_name: string | null;
  current_qty: number;
  reserved_qty: number;
  reorder_threshold: number;
}

export default function useInventoryReport() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("inventory_levels")
        .select(
          "material_type_id, current_qty, reserved_qty, reorder_threshold, material_types(name)",
        );
      if (error) {
        setError(error.message);
        setRows([]);
      } else {
        const mapped = (data ?? []).map((row: any) => ({
          material_type_id: row.material_type_id,
          material_name: row.material_types?.name ?? null,
          current_qty: row.current_qty ?? 0,
          reserved_qty: row.reserved_qty ?? 0,
          reorder_threshold: row.reorder_threshold ?? 0,
        }));
        setRows(mapped);
        setError(null);
      }
      setLoading(false);
    };
    load();
  }, []);

  return { rows, loading, error } as const;
}
