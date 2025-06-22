import React, { useState, useMemo } from 'react';
import useAuth from '../../lib/hooks/useAuth';
import useQuotes from '../../lib/hooks/useQuotes';
import { SZTable } from '../../components/ui/SZTable';
import { SZInput } from '../../components/ui/SZInput';

export default function QuoteListPage() {
  const { role, user } = useAuth();
  const [quotes] = useQuotes();
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  if (!['Sales', 'Manager', 'Admin'].includes(role ?? '')) {
    return <div className="p-4">Access denied</div>;
  }

  const filtered = useMemo(() => {
    let list = quotes;
    if (role === 'Sales') list = list.filter(q => q.created_by === user?.id);
    if (status !== 'all') list = list.filter(q => q.status === status);
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(q => (q.client_name ?? '').toLowerCase().includes(term));
    }
    return list;
  }, [quotes, status, search, role, user]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Quotes</h1>
      <div className="flex gap-2 flex-wrap items-end">
        <SZInput id="search" placeholder="Search" value={search} onChange={setSearch} />
        <select className="border rounded px-2 py-1" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <SZTable headers={["Client", "Total", "Status"]}>
          {filtered.map(q => (
            <tr key={q.id} className="border-t">
              <td className="p-2 border">{q.client_name}</td>
              <td className="p-2 border">${(q.total ?? 0).toFixed(2)}</td>
              <td className="p-2 border">{q.status}</td>
            </tr>
          ))}
        </SZTable>
      </div>
    </div>
  );
}
