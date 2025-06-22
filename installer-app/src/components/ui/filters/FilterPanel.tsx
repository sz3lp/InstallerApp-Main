import React, { useEffect, useState } from "react";
import ModalWrapper from "../../../installer/components/ModalWrapper";
import { SZButton } from "../SZButton";
import { SZCheckbox } from "../SZCheckbox";
import MultiCheckboxFilter, { Option as MCOption } from "./MultiCheckboxFilter";
import DateRangeFilter, { DateRange } from "./DateRangeFilter";

export type AppliedFilters = Record<string, any>;

interface BaseFilterDef {
  key: string;
  label: string;
}

export interface DropdownFilter extends BaseFilterDef {
  type: "dropdown";
  options: MCOption[];
}

export interface MultiSelectFilter extends BaseFilterDef {
  type: "multi";
  options: MCOption[];
}

export interface DateRangeFilterDef extends BaseFilterDef {
  type: "dateRange";
}

export interface BooleanFilterDef extends BaseFilterDef {
  type: "boolean";
}

export interface NumericRangeFilterDef extends BaseFilterDef {
  type: "numericRange";
  minLabel?: string;
  maxLabel?: string;
}

export type FilterDefinition =
  | DropdownFilter
  | MultiSelectFilter
  | DateRangeFilterDef
  | BooleanFilterDef
  | NumericRangeFilterDef;

export interface FilterPanelProps {
  filters: FilterDefinition[];
  onApply: (filters: AppliedFilters) => void;
  initialState?: AppliedFilters;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onApply,
  initialState = {},
}) => {
  const [values, setValues] = useState<AppliedFilters>(initialState);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setValues(initialState);
  }, [initialState]);

  const update = (key: string, val: any) => {
    setValues((v) => ({ ...v, [key]: val }));
  };

  const content = (
    <div className="space-y-4 p-4">
      {filters.map((f) => {
        const val = values[f.key];
        switch (f.type) {
          case "dropdown":
            return (
              <div key={f.key}>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor={f.key}
                >
                  {f.label}
                </label>
                <select
                  id={f.key}
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={val ?? ""}
                  onChange={(e) => update(f.key, e.target.value)}
                >
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          case "multi":
            return (
              <div key={f.key}>
                <p className="text-sm font-medium text-gray-700">{f.label}</p>
                <MultiCheckboxFilter
                  options={f.options}
                  values={val ?? []}
                  onChange={(v) => update(f.key, v)}
                />
              </div>
            );
          case "dateRange":
            return (
              <div key={f.key}>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {f.label}
                </p>
                <DateRangeFilter
                  value={val ?? { start: "", end: "" }}
                  onChange={(v: DateRange) => update(f.key, v)}
                />
              </div>
            );
          case "boolean":
            return (
              <SZCheckbox
                key={f.key}
                id={f.key}
                label={f.label}
                checked={!!val}
                onChange={(v) => update(f.key, v)}
              />
            );
          case "numericRange":
            return (
              <div key={f.key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {f.label}
                </label>
                <input
                  type="number"
                  placeholder={f.minLabel ?? "Min"}
                  className="w-full border rounded px-3 py-2"
                  value={val?.min ?? ""}
                  onChange={(e) =>
                    update(f.key, { ...val, min: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder={f.maxLabel ?? "Max"}
                  className="w-full border rounded px-3 py-2"
                  value={val?.max ?? ""}
                  onChange={(e) =>
                    update(f.key, { ...val, max: e.target.value })
                  }
                />
              </div>
            );
          default:
            return null;
        }
      })}
      <div className="flex justify-end gap-2">
        <SZButton
          variant="secondary"
          onClick={() => {
            setValues(initialState);
            onApply(initialState);
          }}
        >
          Clear
        </SZButton>
        <SZButton onClick={() => onApply(values)}>Apply</SZButton>
      </div>
    </div>
  );

  return (
    <div>
      <div className="hidden sm:block border rounded-md bg-white w-64">
        {content}
      </div>
      <div className="sm:hidden">
        <SZButton variant="secondary" onClick={() => setMobileOpen(true)}>
          Filters
        </SZButton>
        <ModalWrapper isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
          {content}
        </ModalWrapper>
      </div>
    </div>
  );
};

export default FilterPanel;
