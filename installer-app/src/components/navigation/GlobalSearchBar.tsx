import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../../lib/supabaseClient";
import { SearchBar } from "../ui/search/SearchBar";

interface SearchResult {
  id: string;
  label: string;
  entity_type: string;
}

const paths: Record<string, (id: string) => string> = {
  lead: (id) => `/crm/leads/${id}`,
  client: (id) => `/clients/${id}`,
  job: (id) => `/install-manager/job/${id}`,
  invoice: (id) => `/invoices/${id}`,
};

export const GlobalSearchBar: React.FC = () => {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!term) {
      setResults([]);
      return;
    }
    const handler = setTimeout(async () => {
      const { data, error } = await supabase.rpc("global_search_entities", {
        search_term: term,
      });
      if (!error) setResults(data ?? []);
    }, 300);
    return () => clearTimeout(handler);
  }, [term]);

  const groups = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    acc[r.entity_type] = acc[r.entity_type] || [];
    acc[r.entity_type].push(r);
    return acc;
  }, {});

  return (
    <div className="relative">
      <SearchBar placeholder="Search" onSearch={setTerm} />
      {term && results.length > 0 && (
        <div className="absolute z-20 bg-white shadow rounded mt-1 w-64 max-h-80 overflow-y-auto text-gray-800">
          {Object.entries(groups).map(([type, items]) => (
            <div key={type} className="border-b last:border-0">
              <div className="px-2 py-1 text-sm font-semibold capitalize bg-gray-50">
                {type}s
              </div>
              {items.map((r) => (
                <Link
                  key={r.id}
                  to={paths[r.entity_type]?.(r.id) ?? "#"}
                  className="block px-2 py-1 hover:bg-gray-100"
                  onClick={() => setTerm("")}
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
