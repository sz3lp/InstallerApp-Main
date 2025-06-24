import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

export interface InstallTimeRow {
  room_count: number | null;
  avg_duration: number | null;
}

export default function useInstallTimeReport(start?: string, end?: string) {
  const [rows, setRows] = useState<InstallTimeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase
        .from("jobs")
        .select("id, room_count, start_time, end_time");
      if (start) query = query.gte("start_time", start);
      if (end) query = query.lte("end_time", end);
      const { data, error } = await query;
      if (error) {
        setError(error.message);
        setRows([]);
        setLoading(false);
        return;
      }
      const map: Record<number, { total: number; count: number }> = {};
      (data ?? []).forEach((j: any) => {
        const rooms = Number(j.room_count ?? 0);
        if (!map[rooms]) map[rooms] = { total: 0, count: 0 };
        if (j.start_time && j.end_time) {
          const dur =
            (new Date(j.end_time).getTime() -
              new Date(j.start_time).getTime()) /
            3600000;
          map[rooms].total += dur;
          map[rooms].count += 1;
        }
      });
      const result: InstallTimeRow[] = Object.keys(map).map((r) => ({
        room_count: Number(r),
        avg_duration: map[Number(r)].count
          ? map[Number(r)].total / map[Number(r)].count
          : null,
      }));
      result.sort((a, b) => (a.room_count ?? 0) - (b.room_count ?? 0));
      setRows(result);
      setError(null);
      setLoading(false);
    }
    load();
  }, [start, end]);

  return { rows, loading, error } as const;
}
