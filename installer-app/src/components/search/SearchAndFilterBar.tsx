import React, { useEffect, useState } from "react";

export type FilterOption = {
  key: string;
  label: string;
  options: string[];
};

export interface Props {
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onSearch: (query: string) => void;
  onFilterChange: (key: string, value: string) => void;
}

export const SearchAndFilterBar: React.FC<Props> = ({
  searchPlaceholder = "Search...",
  filters = [],
  onSearch,
  onFilterChange,
}) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});

  useEffect(() => {
    const id = setTimeout(() => {
      onSearch(query.trim());
    }, 500);
    return () => clearTimeout(id);
  }, [query, onSearch]);

  const handleFilter = (key: string, value: string) => {
    setSelected((s) => ({ ...s, [key]: value }));
    onFilterChange(key, value);
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
            >
              ×
            </button>
          )}
        </div>
      </div>
      {filters.map((f) => (
        <div key={f.key}>
          <label className="block text-sm font-medium text-gray-700">
            {f.label}
          </label>
          <select
            className="border rounded px-3 py-2"
            value={selected[f.key] ?? ""}
            onChange={(e) => handleFilter(f.key, e.target.value)}
          >
            <option value="">All</option>
            {f.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default SearchAndFilterBar;
