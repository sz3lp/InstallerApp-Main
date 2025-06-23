import React from 'react';
import useRevenueByMonth from '../../lib/hooks/useRevenueByMonth';
import { SZTable } from '../../components/ui/SZTable';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const RevenueDashboardPage: React.FC = () => {
  const rows = useRevenueByMonth();

  const chartData = {
    labels: rows.map((r) =>
      new Date(r.month).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      }),
    ),
    datasets: [
      {
        label: 'Invoiced',
        data: rows.map((r) => r.total_invoiced),
        backgroundColor: '#60a5fa',
      },
      {
        label: 'Paid',
        data: rows.map((r) => r.total_paid),
        backgroundColor: '#34d399',
      },
    ],
  };

  const current = rows[0];
  const previous = rows[1];
  const currentRevenue = current?.total_paid ?? 0;
  const prevRevenue = previous?.total_paid ?? 0;
  const outstanding = current?.outstanding_balance ?? 0;
  const change = prevRevenue
    ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
    : 0;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Revenue Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded p-4">
          <p className="text-sm text-gray-600">This Month Revenue</p>
          <p className="text-lg font-semibold">
            ${currentRevenue.toFixed(2)}
          </p>
          {previous && (
            <p className="text-sm text-gray-500">
              {change >= 0 ? '+' : ''}{change.toFixed(1)}% vs last month
            </p>
          )}
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-sm text-gray-600">Outstanding AR</p>
          <p className="text-lg font-semibold">${outstanding.toFixed(2)}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <Bar data={chartData} />
      </div>
      <SZTable headers={[
        'Month',
        'Invoiced',
        'Paid',
        'Outstanding',
      ]}>
        {rows.map((r) => (
          <tr key={r.month} className="border-t">
            <td className="p-2 border">
              {new Date(r.month).toLocaleDateString(undefined, {
                month: 'short',
                year: 'numeric',
              })}
            </td>
            <td className="p-2 border text-right">
              ${r.total_invoiced.toFixed(2)}
            </td>
            <td className="p-2 border text-right">
              ${r.total_paid.toFixed(2)}
            </td>
            <td className="p-2 border text-right">
              ${r.outstanding_balance.toFixed(2)}
            </td>
          </tr>
        ))}
      </SZTable>
    </div>
  );
};

export default RevenueDashboardPage;
