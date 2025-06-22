import { useState, useCallback, useEffect } from "react";
import supabase from "../supabaseClient";
import useClinics from "./useClinics";

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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [clinics] = useClinics();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from<Lead>("leads")
      .select(
        "id, clinic_name, contact_name, contact_email, contact_phone, address, sales_rep_id, status, updated_at",
      )
      .order("updated_at", { ascending: false });
    setLeads(data ?? []);
    setLoading(false);
  }, []);

  const createLead = useCallback(async (lead: Omit<Lead, "id" | "status" | "updated_at">) => {
    const { data, error } = await supabase
      .from<Lead>("leads")
      .insert(lead)
      .select()
      .single();
    if (error) throw error;
    setLeads((ls) => [data, ...ls]);
    return data;
  }, []);

  const updateStatus = useCallback(async (id: string, status: string) => {
    const { data, error } = await supabase
      .from<Lead>("leads")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setLeads((ls) => ls.map((l) => (l.id === id ? data : l)));
    return data;
  }, []);

  const convertToClientAndJob = useCallback(
    async (lead: Lead) => {
      const { data: clinic } = await supabase
        .from("clinics")
        .insert({
          name: lead.clinic_name,
          contact_name: lead.contact_name,
          contact_email: lead.contact_email,
          address: lead.address,
        })
        .select()
        .single();
      await supabase.from("jobs").insert({
        clinic_name: lead.clinic_name,
        contact_name: lead.contact_name,
        contact_phone: lead.contact_phone,
        status: "created",
      });
      return clinic;
    },
    [],
  );

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    loading,
    fetchLeads,
    createLead,
    updateStatus,
    convertToClientAndJob,
  } as const;
}
