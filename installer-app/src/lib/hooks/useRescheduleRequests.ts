import { useState, useEffect, useCallback, useRef } from "react";
import supabase from "../supabaseClient";
import { useJobs } from "./useJobs";

export interface RescheduleRequest {
  id: string;
  job_id: string;
  requested_date: string;
  reason: string | null;
  status: string;
  created_at: string;
}

const MAX_RETRIES = 5;

export default function useRescheduleRequests(jobId: string) {
  const [requests, setRequests] = useState<RescheduleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const retriesRef = useRef(0);
  const { updateJob } = useJobs();

  const fetchRequests = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("reschedule_requests")
      .select("id, job_id, requested_date, reason, status, created_at")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
    }
    setRequests((data as RescheduleRequest[]) ?? []);
    setLoading(false);
  }, [jobId]);

  const createRequest = useCallback(
    async (requested_date: string, reason: string) => {
      const { data, error } = await supabase
        .from("reschedule_requests")
        .insert({ job_id: jobId, requested_date, reason, status: "pending" })
        .select()
        .single();
      if (error) throw error;
      setRequests((r) => [data as RescheduleRequest, ...r]);
      return data as RescheduleRequest;
    },
    [jobId],
  );

  const updateStatus = useCallback(
    async (id: string, status: string, newDate?: string) => {
      const { data, error } = await supabase
        .from("reschedule_requests")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setRequests((reqs) =>
        reqs.map((r) => (r.id === id ? (data as RescheduleRequest) : r)),
      );
      if (status === "approved" && newDate) {
        await updateJob(jobId, { scheduled_date: newDate });
      }
      return data as RescheduleRequest;
    },
    [jobId, updateJob],
  );

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (!jobId) return;
    const channel = supabase.channel(`reschedule_requests_${jobId}`);

    const subscribe = () => {
      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "reschedule_requests",
            filter: `job_id=eq.${jobId}`,
          },
          (payload) => {
            setRequests((r) => [payload.new as RescheduleRequest, ...r]);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "reschedule_requests",
            filter: `job_id=eq.${jobId}`,
          },
          (payload) => {
            setRequests((rs) =>
              rs.map((r) =>
                r.id === (payload.new as any).id
                  ? (payload.new as RescheduleRequest)
                  : r,
              ),
            );
          },
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            retriesRef.current = 0;
          } else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            handleDisconnect();
          }
        });
    };

    const handleDisconnect = () => {
      supabase.removeChannel(channel);
      if (retriesRef.current < MAX_RETRIES) {
        retriesRef.current += 1;
        setTimeout(subscribe, 1000 * retriesRef.current);
      }
    };

    subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  return {
    requests,
    loading,
    fetchRequests,
    createRequest,
    updateStatus,
  } as const;
}
