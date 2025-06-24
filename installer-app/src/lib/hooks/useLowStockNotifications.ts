import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface LowStockNotification {
  id: string;
  message: string;
  created_at: string;
}

export default function useLowStockNotifications() {
  const [notes, setNotes] = useState<LowStockNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("id, message, created_at")
      .eq("type", "low_stock")
      .eq("dismissed", false)
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      setNotes([]);
    } else {
      setNotes(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  const dismiss = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ dismissed: true })
      .eq("id", id);
    if (!error) {
      setNotes((n) => n.filter((a) => a.id !== id));
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications: notes, loading, error, fetchNotifications, dismiss } as const;
}
