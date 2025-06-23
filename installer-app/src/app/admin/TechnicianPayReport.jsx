import React, { useState } from 'react';
import useAuth from '../../lib/hooks/useAuth';
import usePayReport from '../../lib/hooks/usePayReport';
import { SZInput } from '../../components/ui/SZInput';
import { SZTable } from '../../components/ui/SZTable';

export default function TechnicianPayReport() {
  const { role } = useAuth();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const rows = usePayReport(start, end);

  if (!['Admin', 'Manager', 'Install Manager'].includes(role ?? ''))
    return <div className="p-4">Access denied</div>;

  const total = rows.reduce((s, r) => s + r.payout, 0);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Technician Pay Report</h1>
      <div className="flex gap-2 flex-wrap">
        <SZInput id="start" label="Start" type="date" value={start} onChange={setStart} />
        <SZInput id="end" label="End" type="date" value={end} onChange={setEnd} />
      </div>
      <SZTable headers={["Job", "Installer", "Payout", "Completed"]}>
        {rows.map(r => (
          <tr key={r.job_id} className="border-t">
            <td className="p-2 border">{r.job_id}</td>
            <td className="p-2 border">{r.installer}</td>
            <td className="p-2 border">${r.payout.toFixed(2)}</td>
            <td className="p-2 border">{r.completed_at ? new Date(r.completed_at).toLocaleDateString() : ''}</td>
          </tr>
        ))}
      </SZTable>
      <div className="font-semibold">Total: ${total.toFixed(2)}</div>
    </div>
  );
}
