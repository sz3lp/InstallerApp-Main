import React from 'react';
import useAuth from '../../lib/hooks/useAuth';
import useKPIs from '../../lib/hooks/useKPIs';

export default function AdminDashboard() {
  const { role } = useAuth();
  const kpis = useKPIs();

  if (role !== 'Admin') return <div className="p-4">Access denied</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Business KPIs</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm font-medium">Open Jobs</h3>
          <p className="text-xl font-semibold">{kpis.jobs['in_progress'] || 0}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm font-medium">Invoices</h3>
          <p className="text-xl font-semibold">{kpis.invoices}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm font-medium">Revenue</h3>
          <p className="text-xl font-semibold">${kpis.revenue.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm font-medium">Leads</h3>
          <p className="text-xl font-semibold">{kpis.leads}</p>
        </div>
      </div>
    </div>
  );
}
