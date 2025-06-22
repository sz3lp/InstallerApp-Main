export interface PayLine {
  user_id: string;
  user_name: string | null;
  job_id: string;
  job_name: string | null;
  client_name: string | null;
  completed_at: string | null;
  material_name: string | null;
  rate: number;
  quantity: number;
  subtotal: number;
}

import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

export default function useTechnicianPayReport(
  start?: string,
  end?: string,
  technicianId?: string,
) {
  const [lines, setLines] = useState<PayLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase.from("job_quantities_completed").select(`
          quantity_completed,
          user_id,
          job_id,
          jobs(name, completed_at, client_id, clients(name)),
          materials(name, default_pay_rate),
          users(full_name)
        `);

      if (start) query = query.gte("jobs.completed_at", start);
      if (end) query = query.lte("jobs.completed_at", end);
      if (technicianId) query = query.eq("user_id", technicianId);

      const { data, error } = await query;
      if (error) {
        setError(error.message);
        setLines([]);
      } else {
        const mapped = (data ?? []).map((row: any) => {
          const rate = row.materials?.default_pay_rate ?? 0;
          const qty = row.quantity_completed ?? 0;
          return {
            user_id: row.user_id,
            user_name: row.users?.full_name ?? null,
            job_id: row.job_id,
            job_name: row.jobs?.name ?? null,
            client_name: row.jobs?.clients?.name ?? null,
            completed_at: row.jobs?.completed_at ?? null,
            material_name: row.materials?.name ?? null,
            rate,
            quantity: qty,
            subtotal: qty * rate,
          } as PayLine;
        });
        setLines(mapped);
        setError(null);
      }
      setLoading(false);
    };
    load();
  }, [start, end, technicianId]);

  return { lines, loading, error } as const;
}
