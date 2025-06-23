import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface Job {
  id: string;
  client_id: string | null;
  client_name?: string | null;
  contact_name: string;
  contact_phone: string;
  address: string;
  scheduled_date: string | null;
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
        "id, client_id, contact_name, contact_phone, address, scheduled_date, assigned_to, status, created_at, quote_id, clients(name)"
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
        "id, client_id, contact_name, contact_phone, address, scheduled_date, assigned_to, status, created_at, quote_id, clients(name)"
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
      if (!job.client_id) {
        throw new Error("client_id is required");
      }
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

  const updateJob = useCallback(
    async (id: string, updates: Partial<Job>) => {
      setJobs((js) => js.map((j) => (j.id === id ? { ...j, ...updates } : j)));
      const { data, error } = await supabase
        .from<Job>("jobs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        console.error(error);
        await fetchJobs();
        throw error;
      }
      return data;
    },
    [fetchJobs],
  );

  const updateScheduledDate = useCallback(
    async (id: string, date: string) => {
      setJobs((js) => js.map((j) => (j.id === id ? { ...j, scheduled_date: date } : j)));
      const { error } = await supabase
        .from('jobs')
        .update({ scheduled_date: date })
        .eq('id', id);
      if (error) {
        console.error(error);
        await fetchJobs();
      }
    },
    [fetchJobs],
  );

  const updateStatus = async (jobId: string, newStatus: string) => {
    await supabase.from("jobs").update({ status: newStatus }).eq("id", jobId);

    if (newStatus === "ready_for_invoice") {
      await supabase.rpc("generate_invoice_for_job", { p_job_id: jobId });
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
    updateJob,
    updateScheduledDate,
    updateStatus,
  } as const;
}

export default useJobs;
