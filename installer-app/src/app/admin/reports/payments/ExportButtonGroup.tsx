import React from "react";
import { PaymentReportRow } from "./usePaymentReport";

export interface ExportButtonGroupProps {
  data: PaymentReportRow[];
}

const ExportButtonGroup: React.FC<ExportButtonGroupProps> = ({ data }) => {
  const exportCSV = () => {
    const headers = [
      "id",
      "payment_date",
      "amount",
      "payment_method",
      "reference_number",
      "invoice_id",
      "job_id",
      "client_id",
    ];
    const rows = data.map((d) =>
      headers.map((h) => (d as any)[h] ?? "").join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const html =
      document.getElementById("payment-report-table")?.outerHTML || "";
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`<html><body>${html}</body></html>`);
      win.document.close();
      win.print();
    }
  };

  return (
    <div className="flex gap-2">
      <button onClick={exportCSV} className="px-3 py-1 border rounded bg-white">
        Export CSV
      </button>
      <button onClick={exportPDF} className="px-3 py-1 border rounded bg-white">
        Export PDF
      </button>
    </div>
  );
};

export default ExportButtonGroup;
