import { useState, useCallback, useEffect } from "react";
import supabase from "../supabaseClient";

export interface LeadHistoryEntry {
  id: string;
  lead_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  changed_at: string;
}

export default function useLeadHistory(leadId: string) {
  const [history, setHistory] = useState<LeadHistoryEntry[]>([]);

  const fetchHistory = useCallback(async () => {
    if (!leadId) return;
    const { data } = await supabase
      .from<LeadHistoryEntry>("lead_status_history")
      .select("id, old_status, new_status, changed_by, changed_at")
      .eq("lead_id", leadId)
      .order("changed_at", { ascending: false });
    setHistory(data ?? []);
  }, [leadId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, fetchHistory } as const;
}
