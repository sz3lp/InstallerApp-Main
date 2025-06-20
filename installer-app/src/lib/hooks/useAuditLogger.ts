import { useCallback } from "react";
import supabase from "../supabaseClient";

interface AuditDetails {
  [key: string]: any;
}

export function useAuditLogger() {
  const logEvent = useCallback(
    async (jobId: string, event: string, details: AuditDetails = {}) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const actorId = session?.user?.id ?? null;
        const { error } = await supabase.from("audit_log").insert({
          job_id: jobId,
          actor_id: actorId,
          event,
          details,
        });
        if (error) {
          console.error("Failed to log audit event", error);
        }
      } catch (err) {
        console.error("Unexpected error logging audit event", err);
      }
    },
    []
  );

  return { logEvent };
}

export default useAuditLogger;
