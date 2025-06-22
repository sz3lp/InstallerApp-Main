import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';

export default function useKPIs() {
  const [data, setData] = useState({ jobs: {}, invoices: 0, revenue: 0, leads: 0 });

  useEffect(() => {
    async function load() {
      const { data: jobs } = await supabase.from('jobs').select('status');
      const { data: invoices } = await supabase.from('invoices').select('amount');
      const { data: payments } = await supabase.from('payments').select('amount');
      const { data: leads } = await supabase.from('leads').select('id');

      const jobCounts = {} as Record<string, number>;
      (jobs ?? []).forEach(j => { jobCounts[j.status] = (jobCounts[j.status] || 0) + 1; });
      const invoiceTotal = (invoices ?? []).length;
      const revenue = (payments ?? []).reduce((s,p)=>s+p.amount,0);
      setData({ jobs: jobCounts, invoices: invoiceTotal, revenue, leads: (leads ?? []).length });
    }
    load();
  }, []);

  return data;
}
