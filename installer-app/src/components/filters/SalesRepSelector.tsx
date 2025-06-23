import React from 'react';
import useSalesReps from '../../lib/hooks/useSalesReps';

interface SalesRepSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const SalesRepSelector: React.FC<SalesRepSelectorProps> = ({ value, onChange }) => {
  const { reps } = useSalesReps();
  return (
    <select
      className="border rounded px-3 py-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">All Sales Reps</option>
      {reps.map((r) => (
        <option key={r.id} value={r.id}>
          {r.email || r.id}
        </option>
      ))}
    </select>
  );
};

export default SalesRepSelector;
