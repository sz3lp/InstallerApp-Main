import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface JobDetail {
  id: string;
  client_id: string | null;
  client_name?: string | null;
  address: string;
  notes: string | null;
  status: string;
  assigned_to: string | null;
}

export default function useJobDetail(jobId: string | null) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) {
      setJob(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("id, client_id, address, notes, status, assigned_to, clients(name)")
      .eq("id", jobId)
      .single();
    if (error) {
      setError(error.message);
      setJob(null);
    } else {
      setError(null);
      setJob({
        ...(data as any),
        client_name: (data as any).clients?.name ?? null,
      } as JobDetail);
    }
    setLoading(false);
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return { job, loading, error, refresh: fetchJob } as const;
}
