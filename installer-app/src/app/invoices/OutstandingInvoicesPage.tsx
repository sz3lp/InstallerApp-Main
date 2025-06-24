import React, { useEffect, useMemo, useState } from "react";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import {
  GlobalEmpty,
  GlobalError,
  GlobalLoading,
} from "../../components/global-states";
import supabase from "../../lib/supabaseClient";

interface Row {
  id: string;
  client_id: string | null;
  client_name: string | null;
  due_date: string | null;
  status: string;
  balance_due: number;
  days_overdue: number;
}

function csvEscape(value: string | number | null) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

const OutstandingInvoicesPage: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("invoices")
        .select(
          "id, client_id, clients(name), invoice_total, amount_paid, payment_status, due_date",
        )
        .neq("payment_status", "paid")
        .order("due_date", { ascending: true });
      if (error) {
        console.error(error);
        setError(error.message);
        setRows([]);
        setLoading(false);
        return;
      }
      const list = (data ?? []).map((inv: any) => {
        const due = inv.due_date ? new Date(inv.due_date).getTime() : null;
        let days = 0;
        if (due) {
          days = Math.floor((Date.now() - due) / (1000 * 60 * 60 * 24));
          if (days < 0) days = 0;
        }
        return {
          id: inv.id,
          client_id: inv.client_id ?? null,
          client_name: inv.clients?.name ?? null,
          due_date: inv.due_date,
          status: inv.payment_status,
          balance_due: Number(inv.invoice_total ?? 0) - Number(inv.amount_paid ?? 0),
          days_overdue: days,
        } as Row;
      });
      setRows(list);
      setError(null);
      setLoading(false);
    }
    load();
  }, []);

  const buckets = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        const amt = r.balance_due ?? 0;
        if (r.days_overdue <= 30) acc["0-30"] += amt;
        else if (r.days_overdue <= 60) acc["31-60"] += amt;
        else if (r.days_overdue <= 90) acc["61-90"] += amt;
        else acc["91+"] += amt;
        return acc;
      },
      { "0-30": 0, "31-60": 0, "61-90": 0, "91+": 0 } as Record<string, number>,
    );
  }, [rows]);

  const exportCSV = () => {
    const headers = ["id", "client", "due_date", "status", "balance_due", "days_overdue"];
    const csvRows = rows.map((r) =>
      [
        r.id,
        csvEscape(r.client_name ?? r.client_id ?? ""),
        r.due_date ?? "",
        r.status,
        r.balance_due.toFixed(2),
        r.days_overdue,
      ].join(","),
    );
    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "outstanding_invoices.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Outstanding Invoices</h1>
        <SZButton size="sm" onClick={exportCSV}>
          Export CSV
        </SZButton>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(buckets).map(([label, total]) => (
          <div key={label} className="bg-white shadow rounded p-4">
            <p className="text-sm text-gray-600">{label} days</p>
            <p className="text-lg font-semibold">${total.toFixed(2)}</p>
          </div>
        ))}
      </div>
      {loading && <GlobalLoading />}
      {error && <GlobalError message={error} />}
      {!loading && !error && rows.length === 0 && (
        <GlobalEmpty message="No outstanding invoices" />
      )}
      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto">
          <SZTable
            headers={["Invoice", "Client", "Due", "Status", "Balance", "Days Overdue"]}
          >
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 border">{r.id}</td>
                <td className="p-2 border">{r.client_name ?? r.client_id}</td>
                <td className="p-2 border">
                  {r.due_date ? new Date(r.due_date).toLocaleDateString() : ""}
                </td>
                <td className="p-2 border">{r.status}</td>
                <td className="p-2 border text-right">${r.balance_due.toFixed(2)}</td>
                <td className="p-2 border text-right">{r.days_overdue}</td>
              </tr>
            ))}
          </SZTable>
        </div>
      )}
    </div>
  );
};

export default OutstandingInvoicesPage;
