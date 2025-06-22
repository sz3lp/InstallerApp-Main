import React from "react";
import { PaymentReportRow } from "./usePaymentReport";

export interface PaymentSummaryPanelProps {
  data: PaymentReportRow[];
}

const PaymentSummaryPanel: React.FC<PaymentSummaryPanelProps> = ({ data }) => {
  const total = data.reduce((s, r) => s + (r.amount ?? 0), 0);
  const byMethod: Record<string, number> = {};
  data.forEach((d) => {
    const key = d.payment_method || "unknown";
    byMethod[key] = (byMethod[key] || 0) + d.amount;
  });
  const overpaid = data.filter(
    (d) => d.invoice_amount !== null && d.amount > (d.invoice_amount ?? 0),
  ).length;
  const unlinked = data.filter((d) => !d.invoice_id && !d.job_id).length;

  return (
    <div className="space-y-2 bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold">Summary</h2>
      <div>Total Received: ${total.toFixed(2)}</div>
      <div className="text-sm text-gray-600">Breakdown by Method:</div>
      <ul className="list-disc list-inside text-sm">
        {Object.entries(byMethod).map(([m, amt]) => (
          <li key={m}>
            {m}: ${amt.toFixed(2)}
          </li>
        ))}
      </ul>
      <div className="text-sm">Overpayments: {overpaid}</div>
      <div className="text-sm">Unlinked Payments: {unlinked}</div>
    </div>
  );
};

export default PaymentSummaryPanel;
