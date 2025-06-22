import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";
import { useAuth } from "./useAuth";

export interface OnboardingStatus {
  completedTasks: string[];
  dismissedAt: string | null;
}

export function useOnboardingStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("user_settings")
      .select("onboarding_completed_tasks, onboarding_dismissed_at")
      .eq("user_id", user.id)
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        // no record
        setStatus({ completedTasks: [], dismissedAt: null });
        setError(null);
      } else {
        setError(error.message);
        setStatus(null);
      }
    } else {
      setStatus({
        completedTasks: data.onboarding_completed_tasks ?? [],
        dismissedAt: data.onboarding_dismissed_at,
      });
      setError(null);
    }
    setLoading(false);
  }, [user]);

  const markComplete = useCallback(
    async (taskId: string) => {
      if (!user) return;
      const current = status?.completedTasks ?? [];
      if (current.includes(taskId)) return;
      const next = [...current, taskId];
      setStatus((s) =>
        s
          ? { ...s, completedTasks: next }
          : { completedTasks: next, dismissedAt: null },
      );
      await supabase.from("user_settings").upsert(
        {
          user_id: user.id,
          onboarding_completed_tasks: next,
        },
        { onConflict: "user_id" },
      );
    },
    [user, status],
  );

  const dismiss = useCallback(async () => {
    if (!user) return;
    const now = new Date().toISOString();
    setStatus((s) =>
      s ? { ...s, dismissedAt: now } : { completedTasks: [], dismissedAt: now },
    );
    await supabase.from("user_settings").upsert(
      {
        user_id: user.id,
        onboarding_dismissed_at: now,
      },
      { onConflict: "user_id" },
    );
  }, [user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const progress = status ? status.completedTasks.length : 0;

  return {
    status,
    loading,
    error,
    fetchStatus,
    markComplete,
    dismiss,
    progress,
  } as const;
}

export default useOnboardingStatus;
