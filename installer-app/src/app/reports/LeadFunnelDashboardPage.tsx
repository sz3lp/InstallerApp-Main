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
  const { metrics, loading, error } = useLeadFunnelMetrics();
  const { reps } = useSalesReps();
  const [rep, setRep] = useState<string>("");

  const filtered = rep ? metrics.filter((m) => m.sales_rep_id === rep) : metrics;

  const totals = filtered.reduce(
    (acc, m) => {
      acc.leads_new += m.leads_new;
      acc.leads_contacted += m.leads_contacted;
      acc.leads_quoted += m.leads_quoted;
      acc.leads_converted += m.leads_converted;
      return acc;
    },
    { leads_new: 0, leads_contacted: 0, leads_quoted: 0, leads_converted: 0 },
  );

  const chartData = [
    { label: "New", value: totals.leads_new },
    { label: "Contacted", value: totals.leads_contacted },
    { label: "Quoted", value: totals.leads_quoted },
    { label: "Converted", value: totals.leads_converted },
  ];

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
          onChange={(e) => setRep(e.target.value)}
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
                "Sales Rep",
                "Conversion %",
                "Avg Time to Quote",
                "Avg Time to Job",
              ]}
            >
              {filtered.map((m) => (
                <tr key={m.sales_rep_id ?? "none"} className="border-t">
                  <td className="p-2 border">{m.sales_rep_id ?? "Unassigned"}</td>
                  <td className="p-2 border text-right">
                    {m.conversion_rate ?? 0}%
                  </td>
                  <td className="p-2 border text-right">
                    {m.avg_time_to_quote ?? "N/A"}
                  </td>
                  <td className="p-2 border text-right">
                    {m.avg_time_to_job ?? "N/A"}
                  </td>
                </tr>
              ))}
            </SZTable>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadFunnelDashboardPage;
