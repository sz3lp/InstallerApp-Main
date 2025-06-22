import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface Job {
  id: string;
  client_id: string | null;
  client_name?: string | null;
  contact_name: string;
  contact_phone: string;
  assigned_to: string | null;
  status: string;
  created_at: string;
  quote_id?: string | null;
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id, client_id, contact_name, contact_phone, assigned_to, status, created_at, quote_id, clients(name)"
      )
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      setJobs([]);
    } else {
      const list = (data ?? []).map((j: any) => ({
        ...j,
        client_name: j.clients?.name ?? null,
      }));
      setJobs(list);
      setError(null);
    }
    setLoading(false);
  }, []);

  const fetchMyJobs = useCallback(async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id, client_id, contact_name, contact_phone, assigned_to, status, created_at, quote_id, clients(name)"
      )
      .eq("assigned_to", userId)
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      setJobs([]);
    } else {
      const list = (data ?? []).map((j: any) => ({
        ...j,
        client_name: j.clients?.name ?? null,
      }));
      setJobs(list);
      setError(null);
    }
    setLoading(false);
  }, []);

  const createJob = useCallback(
    async (
      job: Omit<Job, "id" | "status" | "assigned_to" | "created_at"> & {
        quote_id?: string;
      },
    ) => {
      const { data, error } = await supabase
        .from<Job>("jobs")
        .insert({ ...job })
        .select()
        .single();
      if (error) throw error;
      setJobs((j) => [data, ...j]);
      return data;
    },
    [],
  );

  const assignJob = useCallback(async (id: string, userId: string) => {
    const { data, error } = await supabase
      .from<Job>("jobs")
      .update({ assigned_to: userId, status: "assigned" })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setJobs((js) => js.map((j) => (j.id === id ? data : j)));
    return data;
  }, []);

  const updateStatus = async (jobId: string, newStatus: string) => {
    await supabase.from("jobs").update({ status: newStatus }).eq("id", jobId);

    if (newStatus === "complete") {
      const { data: job } = await supabase
        .from("jobs")
        .select("id, quote_id")
        .eq("id", jobId)
        .single();
      if (job?.quote_id) {
        const { data: quote } = await supabase
          .from("quotes")
          .select("id, client_id, quote_items(quantity, unit_price, total)")
          .eq("id", job.quote_id)
          .single();
        if (quote) {
          const total = (quote.quote_items ?? []).reduce(
            (s: number, it: any) => s + (it.total ?? it.quantity * it.unit_price),
            0,
          );
          const { data: existing } = await supabase
            .from("invoices")
            .select("id")
            .eq("job_id", jobId)
            .maybeSingle();
          if (!existing) {
            await supabase.from("invoices").insert({
              job_id: jobId,
              quote_id: quote.id,
              client_id: quote.client_id,
              amount: total,
              status: "unpaid",
            });
          }
        }
      }
    }

    await fetchJobs();
  };

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    fetchMyJobs,
    fetchJobs,
    createJob,
    assignJob,
    updateStatus,
  } as const;
}

export default useJobs;
