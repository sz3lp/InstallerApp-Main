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

export interface LeadFilters {
  status?: string;
  salesRepId?: string;
}

export default function useLeads(filters: LeadFilters = {}) {
  const { role, user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const allowed =
    role === "Sales" ||
    role === "Manager" ||
    role === "Install Manager" ||
    role === "Admin";

  const fetchLeads = useCallback(
    async (status?: string, salesRep?: string) => {
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
      if (salesRep) query = query.eq("sales_rep_id", salesRep);
      const { data, error } = await query;
      if (error) {
        setError(error);
        setLeads([]);
      } else {
        setError(null);
        setLeads(data ?? []);
      }
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
      if (!user) throw new Error("Unauthorized");
      const jobId = await callConvertLeadToClientAndJob(id, user.id);
      // mark lead as converted locally
      setLeads((ls) =>
        ls.map((l) => (l.id === id ? { ...l, status: "converted" } : l)),
      );
      return jobId;
    },
    [allowed, user],
  );

  useEffect(() => {
    fetchLeads(filters.status, filters.salesRepId);
  }, [fetchLeads, filters.status, filters.salesRepId]);

  return {
    leads,
    data: leads,
    loading,
    error,
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

async function callConvertLeadToClientAndJob(leadId: string, userId: string) {
  const mod = await import("../leadEvents");
  return await mod.convertLeadToClientAndJob(leadId, userId);
}
