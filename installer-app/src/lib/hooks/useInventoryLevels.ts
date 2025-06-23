import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface InventoryAlert {
  id: string;
  material_id: string;
  material_name: string | null;
  current_stock: number;
  threshold: number;
  alert_timestamp: string;
  is_resolved: boolean;
}

export default function useInventoryLevels() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("inventory_alerts")
      .select(
        `id, material_id, current_stock, threshold, alert_timestamp, is_resolved, materials(name)`,
      )
      .eq("is_resolved", false)
      .order("alert_timestamp", { ascending: false });
    if (error) {
      setError(error.message);
      setAlerts([]);
    } else {
      const mapped = (data ?? []).map((row: any) => ({
        id: row.id,
        material_id: row.material_id,
        material_name: row.materials?.name ?? null,
        current_stock: row.current_stock,
        threshold: row.threshold,
        alert_timestamp: row.alert_timestamp,
        is_resolved: row.is_resolved,
      }));
      setError(null);
      setAlerts(mapped);
    }
    setLoading(false);
  }, []);

  const markResolved = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("inventory_alerts")
      .update({ is_resolved: true })
      .eq("id", id);
    if (!error) {
      setAlerts((a) => a.filter((al) => al.id !== id));
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, loading, error, fetchAlerts, markResolved } as const;
}
