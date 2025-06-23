import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";
import useAuth from "./useAuth";

export interface LeadDetail {
  id: string;
  clinic_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  sales_rep_id: string | null;
  status: string;
  updated_by: string | null;
  updated_at: string;
}

export interface LeadHistoryEntry {
  id: string;
  lead_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  changed_at: string;
}

export default function useLead(leadId: string | null) {
  const { role } = useAuth();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [history, setHistory] = useState<LeadHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const allowed =
    role === "Sales" ||
    role === "Manager" ||
    role === "Install Manager" ||
    role === "Admin";

  const fetchLead = useCallback(async () => {
    if (!leadId || !allowed) {
      setLead(null);
      setHistory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from<LeadDetail>("leads")
      .select(
        "id, clinic_name, contact_name, contact_email, contact_phone, address, sales_rep_id, status, updated_by, updated_at",
      )
      .eq("id", leadId)
      .single();
    setLead(data ?? null);

    const { data: hist } = await supabase
      .from<LeadHistoryEntry>("lead_status_history")
      .select("id, lead_id, old_status, new_status, changed_by, changed_at")
      .eq("lead_id", leadId)
      .order("changed_at", { ascending: false });
    setHistory(hist ?? []);
    setLoading(false);
  }, [leadId, allowed]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  return { lead, history, loading, refresh: fetchLead } as const;
}
