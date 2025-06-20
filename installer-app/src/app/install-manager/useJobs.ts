import { useEffect, useState, useCallback } from "react";
import supabase from "../../lib/supabaseClient";
import type { Job } from "../../components/JobCard";

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("jobs")
      .select("id, address, assigned_to, status, scheduled_date")
      .order("scheduled_date", { ascending: true });
    if (error) {
      setError(error.message);
    }
    setJobs(
      (data ?? []).map((j) => ({
        id: j.id,
        address: j.address,
        assignedTo: j.assigned_to,
        status: j.status,
        scheduledDate: j.scheduled_date,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, refresh: fetchJobs };
}
