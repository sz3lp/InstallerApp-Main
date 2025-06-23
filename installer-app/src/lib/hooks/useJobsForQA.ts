import { useState, useCallback, useEffect } from "react";
import supabase from "../supabaseClient";

export interface QAJob {
  id: string;
  clinic_name: string | null;
  completed_at: string | null;
  assigned_to: string | null;
  status: string;
}

export interface QAFilters {
  status?: string;
  installerId?: string;
}

export const useJobsForQA = (filters: QAFilters = {}) => {
  const [jobs, setJobs] = useState<QAJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("jobs")
      .select("id, clinic_name, completed_at, assigned_to, status")
      .order("completed_at", { ascending: false });
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.installerId) query = query.eq("assigned_to", filters.installerId);
    const { data, error } = await query;
    if (error) {
      setError(error.message);
      setJobs([]);
    } else {
      setError(null);
      setJobs(data ?? []);
    }
    setLoading(false);
  }, [filters.status, filters.installerId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, fetchJobs } as const;
};

export default useJobsForQA;
