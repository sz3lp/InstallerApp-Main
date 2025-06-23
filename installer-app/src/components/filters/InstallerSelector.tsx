import React from 'react';
import useInstallers from '../../lib/hooks/useInstallers';

interface InstallerSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const InstallerSelector: React.FC<InstallerSelectorProps> = ({ value, onChange }) => {
  const { installers } = useInstallers();
  return (
    <select
      className="border rounded px-3 py-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">All Installers</option>
      {installers.map((i) => (
        <option key={i.id} value={i.id}>
          {i.full_name || i.id}
        </option>
      ))}
    </select>
  );
};

export default InstallerSelector;
