import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { SZTable } from "../../components/ui/SZTable";
import { SZButton } from "../../components/ui/SZButton";
import {
  GlobalLoading,
  GlobalError,
  GlobalEmpty,
} from "../../components/global-states";
import useAuth from "../../lib/hooks/useAuth";
import supabase from "../../lib/supabaseClient";

interface InventoryRow {
  material_type_id: string;
  material_name: string | null;
  current_qty: number;
  reserved_qty: number;
  reorder_threshold: number;
}

function csvEscape(value: string | number | null) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

const PAGE_SIZE = 20;

const InventoryReportPage: React.FC = () => {
  const { role, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("inventory_levels")
        .select(
          "material_type_id, current_qty, reserved_qty, reorder_threshold, material_types(name)"
        )
        .order("material_type_id");
      if (error) {
        setError(error.message);
        setRows([]);
      } else {
        const mapped = (data ?? []).map((r: any) => ({
          material_type_id: r.material_type_id,
          material_name: r.material_types?.name ?? null,
          current_qty: r.current_qty,
          reserved_qty: r.reserved_qty,
          reorder_threshold: r.reorder_threshold,
        }));
        setRows(mapped);
        setError(null);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (authLoading) return <GlobalLoading />;
  if (role !== "Admin" && role !== "Install Manager") {
    return <Navigate to="/unauthorized" replace />;
  }

  const pageCount = Math.ceil(rows.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const visible = rows.slice(start, start + PAGE_SIZE);

  const exportCSV = () => {
    let csv = "Material,Current Qty,Reserved Qty,Available,Reorder Threshold\n";
    visible.forEach((r) => {
      csv +=
        [
          csvEscape(r.material_name ?? r.material_type_id),
          r.current_qty,
          r.reserved_qty,
          r.current_qty - r.reserved_qty,
          r.reorder_threshold,
        ].join(",") + "\n";
    });
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
        <h1 className="text-2xl font-bold">Inventory Report</h1>
        <SZButton size="sm" onClick={exportCSV}>
          Export CSV
        </SZButton>
      </div>
      {loading ? (
        <GlobalLoading />
      ) : error ? (
        <GlobalError message={error} />
      ) : rows.length === 0 ? (
        <GlobalEmpty message="No inventory records." />
      ) : (
        <div className="space-y-2 overflow-x-auto">
          <SZTable
            headers={[
              "Material",
              "Current",
              "Reserved",
              "Available",
              "Reorder",
            ]}
          >
            {visible.map((r) => (
              <tr key={r.material_type_id} className="border-t">
                <td className="p-2 border">
                  {r.material_name ?? r.material_type_id}
                </td>
                <td className="p-2 border text-right">{r.current_qty}</td>
                <td className="p-2 border text-right">{r.reserved_qty}</td>
                <td className="p-2 border text-right">
                  {r.current_qty - r.reserved_qty}
                </td>
                <td className="p-2 border text-right">{r.reorder_threshold}</td>
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

