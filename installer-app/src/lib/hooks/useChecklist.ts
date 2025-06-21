import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface ChecklistItem {
  id: string;
  job_id: string;
  description: string;
  completed: boolean;
}

export function useChecklist(jobId: string) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from<ChecklistItem>("checklist_items")
      .select("id, job_id, description, completed")
      .eq("job_id", jobId)
      .order("id");
    if (error) {
      setError(error.message);
      setItems([]);
    } else {
      setItems(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [jobId]);

  const toggleItem = useCallback(async (id: string, completed: boolean) => {
    const { data, error } = await supabase
      .from<ChecklistItem>("checklist_items")
      .update({ completed })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setItems((items) => items.map((i) => (i.id === id ? data : i)));
    return data;
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, fetchItems, toggleItem } as const;
}

export default useChecklist;
