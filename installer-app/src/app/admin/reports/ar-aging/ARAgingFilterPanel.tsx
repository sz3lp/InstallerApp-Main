import React from "react";
import FilterPanel, {
  FilterDefinition,
  AppliedFilters,
} from "../../../../components/ui/filters/FilterPanel";
import useClients from "../../../../lib/hooks/useClients";
import useSalesReps from "../../../../lib/hooks/useSalesReps";

export interface ARAgingFilters extends AppliedFilters {
  date?: { start: string; end: string };
  client?: string;
  status?: string[];
  balance?: { min?: string; max?: string };
  salesperson?: string;
}

export interface ARAgingFilterPanelProps {
  filters: ARAgingFilters;
  onApply: (f: ARAgingFilters) => void;
}

const ARAgingFilterPanel: React.FC<ARAgingFilterPanelProps> = ({
  filters,
  onApply,
}) => {
  const [clients] = useClients();
  const { reps } = useSalesReps();

  const defs: FilterDefinition[] = [
    { key: "date", label: "Invoice Date", type: "dateRange" },
    {
      key: "client",
      label: "Client",
      type: "dropdown",
      options: [
        { value: "", label: "Any" },
        ...clients.map((c) => ({ value: c.id, label: c.name })),
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "multi",
      options: [
        { value: "paid", label: "Paid" },
        { value: "partially_paid", label: "Partially Paid" },
        { value: "unpaid", label: "Unpaid" },
      ],
    },
    { key: "balance", label: "Balance Due", type: "numericRange" },
    {
      key: "salesperson",
      label: "Sales Rep",
      type: "dropdown",
      options: [
        { value: "", label: "Any" },
        ...reps.map((r) => ({ value: r.id, label: r.email ?? r.id })),
      ],
    },
  ];

  return (
    <FilterPanel
      filters={defs}
      onApply={(f) => onApply(f as ARAgingFilters)}
      initialState={filters}
    />
  );
};

export default ARAgingFilterPanel;
