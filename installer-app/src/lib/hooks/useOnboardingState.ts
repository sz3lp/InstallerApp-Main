import { useCallback, useEffect, useState } from "react";
import supabase from "../supabaseClient";

type Status = {
  installer_started_job: boolean;
  sales_created_quote: boolean;
  manager_reviewed_job: boolean;
  admin_invited_user: boolean;
  dismissed: boolean;
};

export default function useOnboardingState(userId: string | null) {
  const [status, setStatus] = useState<Status | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("user_onboarding_status")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (!data) {
      await supabase.from("user_onboarding_status").insert({ user_id: userId });
      setStatus({
        installer_started_job: false,
        sales_created_quote: false,
        manager_reviewed_job: false,
        admin_invited_user: false,
        dismissed: false,
      });
    } else {
      setStatus({
        installer_started_job: data.installer_started_job,
        sales_created_quote: data.sales_created_quote,
        manager_reviewed_job: data.manager_reviewed_job,
        admin_invited_user: data.admin_invited_user,
        dismissed: data.dismissed,
      });
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const completeTask = useCallback(
    async (taskId: keyof Omit<Status, "dismissed">) => {
      if (!userId || !status) return;
      const fields: Partial<Status> = { [taskId]: true } as any;
      setStatus({ ...status, ...fields });
      await supabase
        .from("user_onboarding_status")
        .update(fields)
        .eq("user_id", userId);
    },
    [userId, status],
  );

  const dismiss = useCallback(async () => {
    if (!userId || !status) return;
    setStatus({ ...status, dismissed: true });
    await supabase
      .from("user_onboarding_status")
      .update({ dismissed: true })
      .eq("user_id", userId);
  }, [userId, status]);

  const completedTasks = status
    ? (Object.entries(status) as [keyof Status, boolean][])
        .filter(([k, v]) => k !== "dismissed" && v)
        .map(([k]) => k as string)
    : [];
  const dismissed = status?.dismissed ?? false;

  return { completedTasks, dismissed, completeTask, dismiss } as const;
}
