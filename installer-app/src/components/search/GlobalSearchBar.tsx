import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useGlobalSearch, { SearchResult } from '../../lib/hooks/useGlobalSearch';

function getPath(type: string, id: string) {
  switch (type) {
    case 'lead':
      return `/crm/leads/${id}`;
    case 'client':
      return `/clients/${id}`;
    case 'job':
      return `/install-manager/jobs/${id}`;
    case 'invoice':
      return `/invoices/${id}`;
    default:
      return '/';
  }
}

const GlobalSearchBar: React.FC = () => {
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const { results, loading, search } = useGlobalSearch();

  useEffect(() => {
    const id = setTimeout(() => {
      if (term.trim()) search(term.trim());
      else search('');
    }, 300);
    return () => clearTimeout(id);
  }, [term, search]);

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.entity_type]) acc[r.entity_type] = [];
    acc[r.entity_type].push(r);
    return acc;
  }, {});

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search..."
        value={term}
        onFocus={() => setOpen(true)}
        onChange={(e) => setTerm(e.target.value)}
        className="rounded border border-gray-300 px-2 py-1 text-black"
      />
      {open && term && (
        <div
          className="absolute left-0 mt-1 w-64 max-h-60 overflow-auto bg-white text-gray-800 border rounded shadow z-50"
          onMouseLeave={() => setOpen(false)}
        >
          {loading && <div className="p-2 text-sm">Searching...</div>}
          {!loading && results.length === 0 && (
            <div className="p-2 text-sm text-gray-500">No results</div>
          )}
          {!loading &&
            Object.entries(grouped).map(([type, list]) => (
              <div key={type} className="border-t first:border-t-0">
                <div className="px-2 py-1 text-xs font-semibold uppercase bg-gray-100">
                  {type}
                </div>
                {list.map((r) => (
                  <Link
                    key={r.id}
                    to={getPath(r.entity_type, r.id)}
                    className="block px-2 py-1 hover:bg-gray-200"
                    onClick={() => {
                      setTerm('');
                      setOpen(false);
                    }}
                  >
                    {r.label}
                  </Link>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default GlobalSearchBar;
