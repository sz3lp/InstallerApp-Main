import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface Job {
  id: string;
  clinic_name: string;
  contact_name: string;
  contact_phone: string;
  assigned_to: string | null;
  status: string;
  created_at: string;
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from<Job>("jobs")
      .select(
        "id, clinic_name, contact_name, contact_phone, assigned_to, status, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      setJobs([]);
    } else {
      setJobs(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  const fetchMyJobs = useCallback(async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from<Job>("jobs")
      .select(
        "id, clinic_name, contact_name, contact_phone, assigned_to, status, created_at",
      )
      .eq("assigned_to", userId)
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      setJobs([]);
    } else {
      setJobs(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  const createJob = useCallback(
    async (job: Omit<Job, "id" | "status" | "assigned_to" | "created_at">) => {
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
