import React from "react";
import { FaTimes } from "react-icons/fa";
import { AppliedFilters } from "./FilterPanel";

export interface ActiveFiltersDisplayProps {
  filters: AppliedFilters;
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

const formatValue = (val: any) => {
  if (val == null || val === "") return "";
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "object" && "start" in val && "end" in val) {
    return `${val.start || "?"} - ${val.end || "?"}`;
  }
  if (typeof val === "boolean") return val ? "Yes" : "No";
  return String(val);
};

export const ActiveFiltersDisplay: React.FC<ActiveFiltersDisplayProps> = ({
  filters,
  onRemove,
  onClearAll,
}) => {
  const entries = Object.entries(filters).filter(([, v]) =>
    Array.isArray(v) ? v.length > 0 : v !== undefined && v !== "",
  );

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-2">
      {entries.map(([k, v]) => (
        <span
          key={k}
          className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
        >
          {k}: {formatValue(v)}
          <button className="ml-1" onClick={() => onRemove(k)}>
            <FaTimes />
          </button>
        </span>
      ))}
      <button
        className="text-sm text-gray-600 underline ml-2"
        onClick={onClearAll}
      >
        Clear All
      </button>
    </div>
  );
};

export default ActiveFiltersDisplay;
