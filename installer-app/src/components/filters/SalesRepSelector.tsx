import React from "react";
import useSalesReps from "../../lib/hooks/useSalesReps";

export interface SalesRepSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export const SalesRepSelector: React.FC<SalesRepSelectorProps> = ({ value, onChange }) => {
  const { reps } = useSalesReps();

  return (
    <div>
      <label htmlFor="sales-select" className="block text-sm font-medium">
        Sales Rep
      </label>
      <select
        id="sales-select"
        className="border rounded px-2 py-1 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        {reps.map((r) => (
          <option key={r.id} value={r.id}>
            {r.email || r.id}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SalesRepSelector;
