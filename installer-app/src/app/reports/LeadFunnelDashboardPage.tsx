
import React, { useEffect, useState, useMemo } from "react";

import React, { useState } from "react";
import useLeadFunnelMetrics from "../../lib/hooks/useLeadFunnelMetrics";
import useSalesReps from "../../lib/hooks/useSalesReps";
import { SZTable } from "../../components/ui/SZTable";
import {
  FunnelChart,
  Funnel,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";

import supabase from "../../lib/supabaseClient";
import {
  GlobalLoading,
  GlobalError,
  GlobalEmpty,
} from "../../components/global-states";
import { SZTable } from "../../components/ui/SZTable";

interface FunnelRow {
  sales_rep_id: string | null;
  sales_rep_email: string | null;
  total_leads: number;
  leads_with_quotes: number;
  leads_converted_to_jobs: number;
  quote_conversion_rate: number;
  job_conversion_rate: number;
}

const LeadFunnelDashboardPage: React.FC = () => {
  const [rows, setRows] = useState<FunnelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rep, setRep] = useState<string>("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("lead_funnel_metrics")
        .select("*")
        .order("sales_rep_email", { ascending: true });
      if (error) {
        console.error(error);
        setError(error.message);
        setRows([]);
      } else {
        setRows((data as FunnelRow[]) || []);
        setError(null);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(
    () => (rep ? rows.filter((r) => r.sales_rep_id === rep) : rows),
    [rows, rep],
  );

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => ({
        leads: acc.leads + r.total_leads,
        quotes: acc.quotes + r.leads_with_quotes,
        jobs: acc.jobs + r.leads_converted_to_jobs,
      }),
      { leads: 0, quotes: 0, jobs: 0 },
    );
  }, [filtered]);

  const funnelData = [
    { label: "Leads", value: totals.leads },
    { label: "With Quotes", value: totals.quotes },
    { label: "Converted to Jobs", value: totals.jobs },
  ];


const LeadFunnelDashboardPage: React.FC = () => {
  const { metrics, loading, error, fetchMetrics } = useLeadFunnelMetrics();
  const { reps } = useSalesReps();
  const [rep, setRep] = useState<string>("");

  const selectedMetrics = rep
    ? metrics.filter((m) => m.sales_rep_id === rep)
    : metrics;

  const funnelTotals = selectedMetrics.length
    ? selectedMetrics.reduce(
        (acc, m) => {
          acc.total_leads += m.total_leads;
          acc.leads_with_quotes += m.leads_with_quotes;
          acc.leads_converted_to_jobs += m.leads_converted_to_jobs;
          return acc;
        },
        { total_leads: 0, leads_with_quotes: 0, leads_converted_to_jobs: 0 },
      )
    : { total_leads: 0, leads_with_quotes: 0, leads_converted_to_jobs: 0 };

  const chartData = [
    { label: "Leads", value: funnelTotals.total_leads },
    { label: "With Quotes", value: funnelTotals.leads_with_quotes },
    { label: "Converted to Jobs", value: funnelTotals.leads_converted_to_jobs },
  ];

  const onFilterChange = async (id: string) => {
    setRep(id);
    await fetchMetrics(id || undefined);
  };


  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Lead Funnel</h1>
      <div>

        <label htmlFor="rep" className="block text-sm font-medium text-gray-700">

        <label className="block text-sm font-medium" htmlFor="rep">

          Sales Rep
        </label>
        <select
          id="rep"

          value={rep}
          onChange={(e) => setRep(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All</option>
          {rows.map((r) =>
            r.sales_rep_id ? (
              <option key={r.sales_rep_id} value={r.sales_rep_id}>
                {r.sales_rep_email || r.sales_rep_id}
              </option>
            ) : null,
          )}
        </select>
      </div>
      {loading && <GlobalLoading />}
      {error && <GlobalError message={error} />}
      {!loading && !error && rows.length === 0 && (
        <GlobalEmpty message="No funnel data" />
      )}
      {!loading && !error && rows.length > 0 && (
        <>
          <div className="h-80 bg-white p-4 rounded shadow">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip />
                <Funnel dataKey="value" data={funnelData} isAnimationActive={false}>
                  <LabelList position="right" dataKey="label" />

          className="border rounded px-2 py-1"
          value={rep}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          <option value="">All</option>
          {reps.map((r) => (
            <option key={r.id} value={r.id}>
              {r.email ?? r.id}
            </option>
          ))}
        </select>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      {loading && <div>Loading...</div>}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip />
                <Funnel dataKey="value" data={chartData} isAnimationActive>
                  <LabelList dataKey="label" position="right" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <SZTable
              headers={[
                "Sales Rep Email",
                "Leads",
                "Quotes",
                "Jobs",
                "Quote Conversion Rate",
                "Job Conversion Rate",
              ]}
            >
              {filtered.map((r) => (
                <tr
                  key={r.sales_rep_id || "none"}
                  className="border-t"
                >
                  <td className="p-2 border">{r.sales_rep_email || "N/A"}</td>
                  <td className="p-2 border text-right">{r.total_leads}</td>
                  <td className="p-2 border text-right">{r.leads_with_quotes}</td>
                  <td className="p-2 border text-right">
                    {r.leads_converted_to_jobs}
                  </td>
                  <td className="p-2 border text-right">
                    {r.quote_conversion_rate.toFixed(1)}%
                  </td>
                  <td className="p-2 border text-right">
                    {r.job_conversion_rate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </SZTable>
          </div>
        </>

          <SZTable
            headers={[
              "Sales Rep Email",
              "Leads",
              "Quotes",
              "Jobs",
              "Quote Conversion %",
              "Job Conversion %",
            ]}
          >
            {selectedMetrics.map((m) => (
              <tr key={m.sales_rep_id ?? "none"} className="border-t">
                <td className="p-2 border">
                  {m.sales_rep_email ?? "Unassigned"}
                </td>
                <td className="p-2 border text-right">{m.total_leads}</td>
                <td className="p-2 border text-right">{m.leads_with_quotes}</td>
                <td className="p-2 border text-right">
                  {m.leads_converted_to_jobs}
                </td>
                <td className="p-2 border text-right">
                  {m.quote_conversion_rate ?? 0}%
                </td>
                <td className="p-2 border text-right">
                  {m.job_conversion_rate ?? 0}%
                </td>
              </tr>
            ))}
          </SZTable>
        </div>

      )}
    </div>
  );
};

export default LeadFunnelDashboardPage;
