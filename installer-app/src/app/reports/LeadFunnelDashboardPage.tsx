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
        <label className="block text-sm font-medium" htmlFor="rep">
          Sales Rep
        </label>
        <select
          id="rep"
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
