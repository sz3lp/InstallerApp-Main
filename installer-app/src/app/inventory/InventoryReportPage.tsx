import React, { useState } from "react";
import { SZTable } from "../../components/ui/SZTable";
import { SZButton } from "../../components/ui/SZButton";
import {
  GlobalLoading,
  GlobalEmpty,
  GlobalError,
} from "../../components/global-states";
import useInventoryReport from "../../lib/hooks/useInventoryReport";

function csvEscape(value: string | number | null) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

const PAGE_SIZE = 25;

type SortKey = "onHand" | "reserved_qty" | "reorder_threshold";

const InventoryReportPage: React.FC = () => {
  const { rows, loading, error } = useInventoryReport();
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "onHand",
    dir: "desc",
  });

  const toggleSort = (key: SortKey) => {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  };

  const sorted = [...rows].sort((a, b) => {
    const aValue =
      sort.key === "onHand"
        ? a.current_qty - a.reserved_qty
        : (a as any)[sort.key];
    const bValue =
      sort.key === "onHand"
        ? b.current_qty - b.reserved_qty
        : (b as any)[sort.key];
    if (aValue < bValue) return sort.dir === "asc" ? -1 : 1;
    if (aValue > bValue) return sort.dir === "asc" ? 1 : -1;
    return 0;
  });

  const start = page * PAGE_SIZE;
  const visible = sorted.slice(start, start + PAGE_SIZE);
  const pageCount = Math.ceil(rows.length / PAGE_SIZE);

  const exportCSV = () => {
    const headers = ["Material", "On Hand", "Reserved", "Reorder Threshold"];
    const csvRows = rows.map((r) =>
      [
        csvEscape(r.material_name || r.material_type_id),
        r.current_qty - r.reserved_qty,
        r.reserved_qty,
        r.reorder_threshold,
      ].join(","),
    );
    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Levels</h1>
        <SZButton size="sm" onClick={exportCSV}>
          Export CSV
        </SZButton>
      </div>
      {loading && <GlobalLoading />}
      {error && <GlobalError message={error} />}
      {!loading && !error && rows.length === 0 && (
        <GlobalEmpty message="No inventory records." />
      )}
      {!loading && !error && rows.length > 0 && (
        <div className="space-y-2">
          <SZTable
            headers={["Material", "On Hand", "Reserved", "Reorder Threshold"]}
          >
            {visible.map((r) => (
              <tr key={r.material_type_id} className="border-t">
                <td className="p-2 border">
                  {r.material_name || r.material_type_id}
                </td>
                <td
                  className="p-2 border text-right cursor-pointer"
                  onClick={() => toggleSort("onHand")}
                >
                  {r.current_qty - r.reserved_qty}
                </td>
                <td
                  className="p-2 border text-right cursor-pointer"
                  onClick={() => toggleSort("reserved_qty")}
                >
                  {r.reserved_qty}
                </td>
                <td
                  className="p-2 border text-right cursor-pointer"
                  onClick={() => toggleSort("reorder_threshold")}
                >
                  {r.reorder_threshold}
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
      )}
    </div>
  );
};

export default InventoryReportPage;
