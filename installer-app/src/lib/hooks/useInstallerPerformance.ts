import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

export interface InstallerPerformanceRow {
  installer_id: string;
  avg_duration: number | null;
  callback_rate: number | null;
  completion_rate: number | null;
}

export default function useInstallerPerformance(
  start?: string,
  end?: string,
  installerId?: string,
) {
  const [rows, setRows] = useState<InstallerPerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let jobsQuery = supabase
        .from("jobs")
        .select("id, installer_id, duration, callback_rate, created_at");
      if (start) jobsQuery = jobsQuery.gte("created_at", start);
      if (end) jobsQuery = jobsQuery.lte("created_at", end);
      if (installerId) jobsQuery = jobsQuery.eq("installer_id", installerId);
      const { data: jobs, error: jobsErr } = await jobsQuery;
      if (jobsErr) {
        setError(jobsErr.message);
        setRows([]);
        setLoading(false);
        return;
      }

      let checklistQuery = supabase
        .from("checklists")
        .select("installer_id, completion_rate, created_at");
      if (start) checklistQuery = checklistQuery.gte("created_at", start);
      if (end) checklistQuery = checklistQuery.lte("created_at", end);
      if (installerId)
        checklistQuery = checklistQuery.eq("installer_id", installerId);
      const { data: checklists, error: checklistErr } = await checklistQuery;
      if (checklistErr) {
        setError(checklistErr.message);
        setRows([]);
        setLoading(false);
        return;
      }

      const map: Record<
        string,
        {
          count: number;
          dur: number;
          cbr: number;
          cbrCount: number;
          cr: number;
          crCount: number;
        }
      > = {};

      (jobs ?? []).forEach((j: any) => {
        const id = j.installer_id || "unknown";
        if (!map[id])
          map[id] = {
            count: 0,
            dur: 0,
            cbr: 0,
            cbrCount: 0,
            cr: 0,
            crCount: 0,
          };
        map[id].count += 1;
        if (j.duration) map[id].dur += Number(j.duration);
        if (j.callback_rate != null) {
          map[id].cbr += Number(j.callback_rate);
          map[id].cbrCount += 1;
        }
      });

      (checklists ?? []).forEach((c: any) => {
        const id = c.installer_id || "unknown";
        if (!map[id])
          map[id] = {
            count: 0,
            dur: 0,
            cbr: 0,
            cbrCount: 0,
            cr: 0,
            crCount: 0,
          };
        if (c.completion_rate != null) {
          map[id].cr += Number(c.completion_rate);
          map[id].crCount += 1;
        }
      });

      const results: InstallerPerformanceRow[] = Object.keys(map).map((id) => ({
        installer_id: id,
        avg_duration: map[id].count ? map[id].dur / map[id].count : null,
        callback_rate: map[id].cbrCount ? map[id].cbr / map[id].cbrCount : null,
        completion_rate: map[id].crCount ? map[id].cr / map[id].crCount : null,
      }));
      setRows(results);
      setError(null);
      setLoading(false);
    }
    load();
  }, [start, end, installerId]);

  return { rows, loading, error } as const;
}
