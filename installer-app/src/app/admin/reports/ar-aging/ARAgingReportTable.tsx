import React, { useState } from "react";
import { SZTable } from "../../../../components/ui/SZTable";
import { ARAgingReportRow } from "./useARAgingReport";

export interface ARAgingReportTableProps {
  data: ARAgingReportRow[];
}

const PAGE_SIZE = 20;

const ARAgingReportTable: React.FC<ARAgingReportTableProps> = ({ data }) => {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{
    key: keyof ARAgingReportRow;
    dir: "asc" | "desc";
  }>({
    key: "invoice_date",
    dir: "desc",
  });

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

  const toggleSort = (key: keyof ARAgingReportRow) => {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  };

  const pageCount = Math.ceil(data.length / PAGE_SIZE);

  return (
    <div className="space-y-2 overflow-x-auto">
      <SZTable
        headers={[
          "Invoice",
          "Client",
          "Issued",
          "Due",
          "Status",
          "Balance",
          "Job",
          "Sales Rep",
          "Last Payment",
          "Days Overdue",
        ]}
      >
        {visible.map((r) => (
          <tr
            key={r.id}
            className={`border-t ${r.days_overdue > 90 ? "bg-red-100" : ""}`}
          >
            <td className="p-2 border" onClick={() => toggleSort("id")}>
              {r.id}
            </td>
            <td className="p-2 border">{r.client_name ?? r.client_id}</td>
            <td
              className="p-2 border"
              onClick={() => toggleSort("invoice_date")}
            >
              {" "}
              {new Date(r.invoice_date).toLocaleDateString()}
            </td>
            <td className="p-2 border">
              {r.due_date ? new Date(r.due_date).toLocaleDateString() : ""}
            </td>
            <td className="p-2 border">{r.payment_status}</td>
            <td className="p-2 border text-right">
              ${r.balance_due.toFixed(2)}
            </td>
            <td className="p-2 border">{r.job_name ?? r.job_id ?? ""}</td>
            <td className="p-2 border">
              {r.sales_rep_email ?? r.sales_rep_id ?? ""}
            </td>
            <td className="p-2 border">{r.last_payment_method ?? ""}</td>
            <td className="p-2 border text-right">{r.days_overdue}</td>
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

export default ARAgingReportTable;
