import React from "react";
import FilterPanel, {
  FilterDefinition,
  AppliedFilters,
} from "../../../components/ui/filters/FilterPanel";
import useClients from "../../../lib/hooks/useClients";

export interface PaymentFilters extends AppliedFilters {
  date?: { start: string; end: string };
  method?: string;
  client?: string;
  status?: string[];
  amount?: { min?: string; max?: string };
}

export interface PaymentFilterPanelProps {
  filters: PaymentFilters;
  onApply: (f: PaymentFilters) => void;
}

const PaymentFilterPanel: React.FC<PaymentFilterPanelProps> = ({
  filters,
  onApply,
}) => {
  const [clients] = useClients();

  const defs: FilterDefinition[] = [
    { key: "date", label: "Payment Date", type: "dateRange" },
    {
      key: "method",
      label: "Method",
      type: "dropdown",
      options: [
        { value: "", label: "Any" },
        { value: "cash", label: "Cash" },
        { value: "check", label: "Check" },
        { value: "credit_card", label: "Credit Card" },
        { value: "ach", label: "ACH" },
        { value: "other", label: "Other" },
      ],
    },
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
      label: "Invoice Status",
      type: "multi",
      options: [
        { value: "paid", label: "Paid" },
        { value: "partially_paid", label: "Partially Paid" },
        { value: "unpaid", label: "Unpaid" },
      ],
    },
    {
      key: "amount",
      label: "Amount",
      type: "numericRange",
      minLabel: "Min",
      maxLabel: "Max",
    },
  ];

  return (
    <FilterPanel
      filters={defs}
      onApply={(f) => onApply(f as PaymentFilters)}
      initialState={filters}
    />
  );
};

export default PaymentFilterPanel;
