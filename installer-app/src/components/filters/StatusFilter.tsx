import React from "react";

export interface StatusOption {
  value: string;
  label: string;
}

export interface StatusFilterProps {
  options: StatusOption[];
  value: string;
  onChange: (val: string) => void;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({ options, value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium" htmlFor="status-filter">
        Status
      </label>
      <select
        id="status-filter"
        className="border rounded px-2 py-1 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StatusFilter;
