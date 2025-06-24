import React from "react";
import { ARAgingReportRow } from "./useARAgingReport";

export interface ARAgingSummaryPanelProps {
  data: ARAgingReportRow[];
}

const ARAgingSummaryPanel: React.FC<ARAgingSummaryPanelProps> = ({ data }) => {
  const buckets: Record<string, { total: number; count: number }> = {
    "0-30": { total: 0, count: 0 },
    "31-60": { total: 0, count: 0 },
    "61-90": { total: 0, count: 0 },
    "91+": { total: 0, count: 0 },
  };
  data.forEach((r) => {
    const amt = r.balance_due ?? 0;
    let b = "0-30";
    if (r.days_overdue <= 30) b = "0-30";
    else if (r.days_overdue <= 60) b = "31-60";
    else if (r.days_overdue <= 90) b = "61-90";
    else b = "91+";
    buckets[b].total += amt;
    buckets[b].count += 1;
  });

  return (
    <div className="space-y-2 bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold">Aging Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {Object.entries(buckets).map(([label, info]) => (
          <div key={label} className="border p-2 rounded">
            <div className="font-semibold">{label} days</div>
            <div>Invoices: {info.count}</div>
            <div>Total: ${info.total.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ARAgingSummaryPanel;
