import { useState, useCallback, useEffect } from "react";
import supabase from "../supabaseClient";
import useAuth from "./useAuth";

export interface Lead {
  id: string;
  clinic_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  sales_rep_id: string | null;
  status: string;
  updated_at: string;
}

export default function useLeads() {
  const { role } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const allowed = role === "Sales" || role === "Manager" || role === "Admin";

  const fetchLeads = useCallback(
    async (status?: string) => {
      if (!allowed) {
        setLeads([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      let query = supabase
        .from<Lead>("leads")
        .select(
          "id, clinic_name, contact_name, contact_email, contact_phone, address, sales_rep_id, status, updated_at",
        )
        .order("updated_at", { ascending: false });
      if (status) query = query.eq("status", status);
      const { data } = await query;
      setLeads(data ?? []);
      setLoading(false);
    },
    [allowed],
  );

  const createLead = useCallback(
    async (lead: Omit<Lead, "id" | "status" | "updated_at">) => {
      if (!allowed) throw new Error("Unauthorized");
      const { data, error } = await supabase
        .from<Lead>("leads")
        .insert(lead)
        .select()
        .single();
      if (error) throw error;
      setLeads((ls) => [data, ...ls]);
      return data;
    },
    [allowed],
  );

  const updateLeadStatus = useCallback(
    async (id: string, status: string) => {
      if (!allowed) throw new Error("Unauthorized");
      const { data, error } = await supabase
        .from<Lead>("leads")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setLeads((ls) => ls.map((l) => (l.id === id ? data : l)));
      if (status === "appointment_scheduled") await callCreateCalendarInvite(id);
      if (status === "proposal_sent") await callGenerateProposalDocument(id);
      return data;
    },
    [allowed],
  );

  const convertLeadToClientAndJob = useCallback(
    async (id: string) => {
      if (!allowed) throw new Error("Unauthorized");
      await callConvertLeadToClientAndJob(id);
    },
    [allowed],
  );

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    loading,
    fetchLeads,
    createLead,
    updateLeadStatus,
    convertLeadToClientAndJob,
  } as const;
}

async function callCreateCalendarInvite(leadId: string) {
  const mod = await import("../leadEvents");
  await mod.createCalendarInvite(leadId);
}

async function callGenerateProposalDocument(leadId: string) {
  const mod = await import("../leadEvents");
  await mod.generateProposalDocument(leadId);
}

async function callConvertLeadToClientAndJob(leadId: string) {
  const mod = await import("../leadEvents");
  await mod.convertLeadToClientAndJob(leadId);
}
