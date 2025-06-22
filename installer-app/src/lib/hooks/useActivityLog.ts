import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface ActivityJob {
  id: string;
  clinic_name: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export function useActivityLog(
  userId: string | null,
  startDate?: string,
  endDate?: string,
) {
  const [jobs, setJobs] = useState<ActivityJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLog = useCallback(async () => {
    if (!userId) {
      setJobs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let query = supabase
      .from("jobs")
      .select("id, clinic_name, status, created_at, checklists(created_at)")
      .eq("assigned_to", userId)
      .order("created_at", { ascending: false });
    if (startDate) query = query.gte("created_at", startDate);
    if (endDate) query = query.lte("created_at", endDate);
    const { data, error } = await query;
    if (error) {
      setError(error.message);
      setJobs([]);
    } else {
      setError(null);
      const processed =
        data?.map((j: any) => ({
          id: j.id,
          clinic_name: j.clinic_name,
          status: j.status,
          created_at: j.created_at,
          completed_at: j.checklists?.[0]?.created_at ?? null,
        })) ?? [];
      setJobs(processed);
    }
    setLoading(false);
  }, [userId, startDate, endDate]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  return { jobs, loading, error, fetchLog } as const;
}

export default useActivityLog;
