import { useState, useEffect, useCallback } from 'react';
import supabase from '../supabaseClient';

export interface LeadFunnelRow {
  sales_rep_id: string | null;
  leads_new: number;
  leads_contacted: number;
  leads_quoted: number;
  leads_converted: number;
  total_leads: number;
  conversion_rate: number;
  avg_time_to_quote: string | null;
  avg_time_to_job: string | null;
}

export default function useLeadFunnelMetrics() {
  const [rows, setRows] = useState<LeadFunnelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('lead_funnel_metrics')
      .select('*');
    if (error) {
      setError(error.message);
      setRows([]);
    } else {
      setRows((data as LeadFunnelRow[]) || []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return [rows, { loading, error, refresh: fetchMetrics }] as const;
}
