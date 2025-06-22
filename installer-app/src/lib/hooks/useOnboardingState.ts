import { useCallback, useEffect, useState } from 'react';
import supabase from '../supabaseClient';

export default function useOnboardingState(userId: string | null) {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('user_settings')
      .select('onboarding_completed_tasks,onboarding_dismissed_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (!data) {
      await supabase.from('user_settings').insert({ user_id: userId });
      setCompletedTasks([]);
      setDismissed(false);
    } else {
      setCompletedTasks(data.onboarding_completed_tasks ?? []);
      setDismissed(!!data.onboarding_dismissed_at);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const completeTask = useCallback(
    async (taskId: string) => {
      if (!userId) return;
      const updated = Array.from(new Set([...completedTasks, taskId]));
      setCompletedTasks(updated);
      await supabase
        .from('user_settings')
        .update({ onboarding_completed_tasks: updated })
        .eq('user_id', userId);
    },
    [userId, completedTasks],
  );

  const dismiss = useCallback(async () => {
    if (!userId) return;
    setDismissed(true);
    await supabase
      .from('user_settings')
      .update({ onboarding_dismissed_at: new Date().toISOString() })
      .eq('user_id', userId);
  }, [userId]);

  return { completedTasks, dismissed, completeTask, dismiss } as const;
}
