import { useEffect, useState, useCallback } from "react";
import supabase from "../supabaseClient";

export interface LeadFunnelMetric {
  sales_rep_id: string | null;
  leads_new: number;
  leads_contacted: number;
  leads_quoted: number;
  leads_converted: number;
  total_leads: number;
  conversion_rate: number | null;
  avg_time_to_quote: string | null;
  avg_time_to_job: string | null;
}

export default function useLeadFunnelMetrics() {
  const [metrics, setMetrics] = useState<LeadFunnelMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (repId?: string) => {
    setLoading(true);
    let query = supabase
      .from<LeadFunnelMetric>("lead_funnel_metrics")
      .select("*");
    if (repId) query = query.eq("sales_rep_id", repId);
    const { data, error } = await query;
    if (error) {
      setError(error.message);
      setMetrics([]);
    } else {
      setMetrics(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, error, fetchMetrics } as const;
}
