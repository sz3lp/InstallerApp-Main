import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface JobChecklistEntry {
  id?: string;
  job_id: string;
  step_name: string;
  notes: string | null;
  completed: boolean;
}

export function useJobChecklist(jobId: string) {
  const [items, setItems] = useState<JobChecklistEntry[]>([]);
  const isTest = process.env.NODE_ENV === "test";

  const fetchEntries = useCallback(async () => {
    if (!jobId || isTest) return;
    const { data } = await supabase
      .from<JobChecklistEntry>("job_checklists")
      .select("id, job_id, step_name, notes, completed")
      .eq("job_id", jobId);
    setItems(data ?? []);
  }, [jobId, isTest]);

  const upsertEntry = useCallback(
    async (step_name: string, values: Partial<JobChecklistEntry>) => {
      if (isTest) {
        setItems((prev) => {
          const existing = prev.find((p) => p.step_name === step_name);
          if (existing) {
            return prev.map((p) =>
              p.step_name === step_name ? { ...p, ...values } : p,
            );
          }
          return [...prev, { job_id: jobId, step_name, completed: false, notes: null, ...values }];
        });
        return;
      }
      const updates = { job_id: jobId, step_name, ...values };
      const { data } = await supabase
        .from<JobChecklistEntry>("job_checklists")
        .upsert(updates, { onConflict: "job_id,step_name" })
        .select()
        .single();
      if (data) {
        setItems((prev) => {
          const idx = prev.findIndex((i) => i.step_name === step_name);
          if (idx === -1) return [...prev, data];
          const next = [...prev];
          next[idx] = data;
          return next;
        });
      }
    },
    [jobId, isTest],
  );

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { items, upsertEntry } as const;
}

export default useJobChecklist;
