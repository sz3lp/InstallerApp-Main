import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';

export interface PayRow {
  job_id: string;
  installer: string | null;
  payout: number;
  completed_at: string;
}

export default function usePayReport(start?: string, end?: string, installerId?: string) {
  const [rows, setRows] = useState<PayRow[]>([]);

  useEffect(() => {
    async function load() {
      let query = supabase
        .from('jobs')
        .select('id, assigned_to, completed_at, job_materials(quantity, unit_labor_cost)')
        .eq('status', 'complete');
      if (start) query = query.gte('completed_at', start);
      if (end) query = query.lte('completed_at', end);
      if (installerId) query = query.eq('assigned_to', installerId);
      const { data } = await query;
      const mapped = (data ?? []).map(j => {
        const payout = (j.job_materials ?? []).reduce((s,m)=>s + m.quantity * m.unit_labor_cost,0);
        return { job_id: j.id, installer: j.assigned_to, payout, completed_at: j.completed_at } as PayRow;
      });
      setRows(mapped);
    }
    load();
  }, [start, end, installerId]);

  return rows;
}
