import React, { useMemo } from 'react';
import {
  FunnelChart,
  Funnel,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import { SZTable } from '../../components/ui/SZTable';
import { GlobalLoading, GlobalError, GlobalEmpty } from '../../components/global-states';
import useLeadFunnelMetrics from '../../lib/hooks/useLeadFunnelMetrics';

const LeadFunnelDashboardPage: React.FC = () => {
  const [rows, { loading, error }] = useLeadFunnelMetrics();

  const funnelData = useMemo(() => {
    const totals = rows.reduce(
      (acc, r) => {
        acc.new += r.leads_new;
        acc.contacted += r.leads_contacted;
        acc.quoted += r.leads_quoted;
        acc.converted += r.leads_converted;
        return acc;
      },
      { new: 0, contacted: 0, quoted: 0, converted: 0 },
    );
    return [
      { stage: 'New', value: totals.new },
      { stage: 'Contacted', value: totals.contacted },
      { stage: 'Quoted', value: totals.quoted },
      { stage: 'Converted', value: totals.converted },
    ];
  }, [rows]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Lead Funnel</h1>
      {loading && <GlobalLoading />}
      {error && <GlobalError message={error} />}
      {!loading && !error && rows.length === 0 && <GlobalEmpty message="No data" />}
      {!loading && !error && rows.length > 0 && (
        <>
          <div className="h-64 bg-white p-4 rounded shadow">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart width={400} height={250}>
                <Tooltip />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList dataKey="stage" position="right" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
          <SZTable headers={[
            'Sales Rep',
            'Conversion Rate',
            'Avg Time to Quote',
            'Avg Time to Job',
          ]}>
            {rows.map((r) => (
              <tr key={r.sales_rep_id ?? 'none'} className="border-t">
                <td className="p-2 border">{r.sales_rep_id ?? 'Unassigned'}</td>
                <td className="p-2 border">{r.conversion_rate?.toFixed(2)}%</td>
                <td className="p-2 border">{r.avg_time_to_quote ?? '-'}</td>
                <td className="p-2 border">{r.avg_time_to_job ?? '-'}</td>
              </tr>
            ))}
          </SZTable>
        </>
      )}
    </div>
  );
};

export default LeadFunnelDashboardPage;
