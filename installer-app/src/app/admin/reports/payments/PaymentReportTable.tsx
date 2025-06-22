import React, { useState } from "react";
import { SZTable } from "../../../../components/ui/SZTable";
import { PaymentReportRow } from "./usePaymentReport";
import { FaExclamationTriangle } from "react-icons/fa";

export interface PaymentReportTableProps {
  data: PaymentReportRow[];
}

const PAGE_SIZE = 20;

const PaymentReportTable: React.FC<PaymentReportTableProps> = ({ data }) => {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{
    key: keyof PaymentReportRow;
    dir: "asc" | "desc";
  }>({ key: "payment_date", dir: "desc" });

  const sorted = [...data].sort((a, b) => {
    const k = sort.key;
    const av = (a[k] ?? "") as any;
    const bv = (b[k] ?? "") as any;
    if (av < bv) return sort.dir === "asc" ? -1 : 1;
    if (av > bv) return sort.dir === "asc" ? 1 : -1;
    return 0;
  });
  const start = page * PAGE_SIZE;
  const visible = sorted.slice(start, start + PAGE_SIZE);

  const toggleSort = (key: keyof PaymentReportRow) => {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  };

  const pageCount = Math.ceil(data.length / PAGE_SIZE);

  return (
    <div className="space-y-2">
      <SZTable
        headers={[
          "Date",
          "Amount",
          "Method",
          "Client",
          "Invoice",
          "Job",
          "Flags",
        ]}
      >
        {visible.map((p) => (
          <tr key={p.id} className="border-t">
            <td
              className="p-2 border"
              onClick={() => toggleSort("payment_date")}
            >
              {new Date(p.payment_date).toLocaleDateString()}
            </td>
            <td className="p-2 border" onClick={() => toggleSort("amount")}>
              ${p.amount.toFixed(2)}
            </td>
            <td className="p-2 border">{p.payment_method}</td>
            <td className="p-2 border">{p.client_name}</td>
            <td className="p-2 border">{p.invoice_id}</td>
            <td className="p-2 border">{p.job_name ?? p.job_id ?? ""}</td>
            <td className="p-2 border space-x-1">
              {p.invoice_amount !== null &&
                p.amount > (p.invoice_amount ?? 0) && (
                  <span className="px-2 py-1 text-xs bg-red-500 text-white rounded">
                    Overpaid
                  </span>
                )}
              {!p.invoice_id && !p.job_id && (
                <FaExclamationTriangle
                  className="text-orange-500 inline"
                  title="Unlinked"
                />
              )}
              {p.invoice_status && (
                <span className="px-2 py-1 text-xs bg-gray-200 rounded capitalize">
                  {p.invoice_status.replace("_", " ")}
                </span>
              )}
            </td>
          </tr>
        ))}
      </SZTable>
      {pageCount > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-2 py-1 border rounded"
          >
            Prev
          </button>
          <span className="px-2 py-1">
            Page {page + 1} of {pageCount}
          </span>
          <button
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-2 py-1 border rounded"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentReportTable;
