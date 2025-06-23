import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface InventoryAlert {
  id: string;
  installer_id: string;
  installer_name: string | null;
  material_id: string;
  material_name: string;
  quantity: number;
  reorder_threshold: number;
  resolved_at?: string | null;
}

export default function useInventoryLevels() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .rpc<InventoryAlert>("get_low_stock_alerts");
    if (error) {
      setError(error.message);
      setAlerts([]);
    } else {
      setError(null);
      setAlerts(data ?? []);
    }
    setLoading(false);
  }, []);

  const markResolved = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("inventory_alerts")
      .update({ resolved_at: new Date().toISOString() })
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
