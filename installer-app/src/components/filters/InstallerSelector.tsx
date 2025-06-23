import React from "react";
import useInstallers from "../../lib/hooks/useInstallers";

export interface InstallerSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export const InstallerSelector: React.FC<InstallerSelectorProps> = ({ value, onChange }) => {
  const { installers } = useInstallers();

  return (
    <div>
      <label htmlFor="installer-select" className="block text-sm font-medium">
        Installer
      </label>
      <select
        id="installer-select"
        className="border rounded px-2 py-1 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        {installers.map((i) => (
          <option key={i.id} value={i.id}>
            {i.full_name || i.id}
          </option>
        ))}
      </select>
    </div>
  );
};

export default InstallerSelector;
