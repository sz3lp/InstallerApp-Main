import React from 'react';

export interface StatusOption {
  value: string;
  label: string;
}

interface StatusFilterProps {
  options: StatusOption[];
  value: string;
  onChange: (value: string) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ options, value, onChange }) => (
  <select
    className="border rounded px-3 py-2"
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
);

export default StatusFilter;
