import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface DashboardRescheduleRow {
  id: string;
  job_id: string;
  requested_date: string;
  reason: string | null;
  status: string;
  created_at: string;
  jobs?: {
    id: string;
    clinic_name?: string | null;
    scheduled_date: string | null;
    assigned_to: string | null;
  } | null;
}

export interface RescheduleFilters {
  installerId?: string;
  status?: string;
}

export function useAllRescheduleRequests(filters: RescheduleFilters = {}) {
  const [requests, setRequests] = useState<DashboardRescheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("reschedule_requests")
      .select(
        "id, job_id, requested_date, reason, status, created_at, jobs(id, clinic_name, scheduled_date, assigned_to)",
      )
      .order("created_at", { ascending: false });
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.installerId)
      query = query.eq("jobs.assigned_to", filters.installerId);
    const { data, error } = await query;
    if (error) {
      setError(error.message);
      setRequests([]);
    } else {
      const mapped = (data ?? []).map((r: any) => ({
        ...r,
        jobs: r.jobs ?? null,
      }));
      setRequests(mapped);
      setError(null);
    }
    setLoading(false);
  }, [filters.status, filters.installerId]);

  const updateStatus = useCallback(
    async (id: string, status: string, newDate?: string) => {
      const { data, error } = await supabase
        .from("reschedule_requests")
        .update({ status })
        .eq("id", id)
        .select(
          "id, job_id, requested_date, reason, status, created_at, jobs(id, clinic_name, scheduled_date, assigned_to)",
        )
        .single();
      if (error) throw error;
      setRequests((reqs) =>
        reqs.map((r) =>
          r.id === id
            ? { ...(data as any), jobs: (data as any).jobs ?? null }
            : r,
        ),
      );
      if (status === "approved" && newDate) {
        await supabase
          .from("jobs")
          .update({ scheduled_date: newDate })
          .eq("id", (data as any).job_id);
        await supabase.functions.invoke("send_reschedule_notification", {
          body: JSON.stringify({
            job_id: (data as any).job_id,
            new_date: newDate,
          }),
        });
      }
      return data as DashboardRescheduleRow;
    },
    [],
  );

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, error, fetchRequests, updateStatus } as const;
}

export default useAllRescheduleRequests;
