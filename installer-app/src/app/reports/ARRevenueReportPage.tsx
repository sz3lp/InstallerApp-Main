import React, { useEffect, useMemo, useState } from "react";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import { DateRangeFilter } from "../../components/ui/filters/DateRangeFilter";
import useClients from "../../lib/hooks/useClients";
import supabase from "../../lib/supabaseClient";
import {
  GlobalLoading,
  GlobalError,
  GlobalEmpty,
} from "../../components/global-states";

interface Row {
  id: string;
  client_id: string | null;
  client_name: string | null;
  invoice_date: string;
  due_date: string | null;
  status: string;
  amount: number;
  paid: number;
  balance: number;
  days_overdue: number;
}

const ARRevenueReportPage: React.FC = () => {
  const [range, setRange] = useState({ start: "", end: "" });
  const [client, setClient] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients] = useClients();

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase
        .from("invoices")
        .select(
          "id, client_id, clients(name), invoice_total, amount_paid, payment_status, invoice_date, due_date",
        )
        .order("invoice_date", { ascending: false });
      if (range.start) query = query.gte("invoice_date", range.start);
      if (range.end) query = query.lte("invoice_date", range.end);
      if (client) query = query.eq("client_id", client);
      const { data, error } = await query;
      if (error) {
        console.error(error);
        setError(error.message);
        setRows([]);
      } else {
        const list = (data ?? []).map((i: any) => {
          const due = i.due_date ? new Date(i.due_date).getTime() : null;
          let days = 0;
          if (due && i.payment_status !== "paid") {
            days = Math.floor((Date.now() - due) / (1000 * 60 * 60 * 24));
            if (days < 0) days = 0;
          }
          return {
            id: i.id,
            client_id: i.client_id ?? null,
            client_name: i.clients?.name ?? null,
            invoice_date: i.invoice_date,
            due_date: i.due_date,
            status: i.payment_status,
            amount: Number(i.invoice_total ?? 0),
            paid: Number(i.amount_paid ?? 0),
            balance: Number(i.invoice_total ?? 0) - Number(i.amount_paid ?? 0),
            days_overdue: days,
          } as Row;
        });
        setRows(list);
        setError(null);
      }
      setLoading(false);
    }
    load();
  }, [range.start, range.end, client]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.billed += r.amount;
        acc.collected += r.paid;
        acc.outstanding += r.balance;
        if (r.balance > 0) {
          if (r.days_overdue <= 30) acc.buckets["0-30"] += r.balance;
          else if (r.days_overdue <= 60) acc.buckets["31-60"] += r.balance;
          else if (r.days_overdue <= 90) acc.buckets["61-90"] += r.balance;
          else acc.buckets["91+"] += r.balance;
        }
        return acc;
      },
      {
        billed: 0,
        collected: 0,
        outstanding: 0,
        buckets: { "0-30": 0, "31-60": 0, "61-90": 0, "91+": 0 } as Record<
          string,
          number
        >,
      },
    );
  }, [rows]);

  const exportCSV = () => {
    const headers = [
      "id",
      "client",
      "invoice_date",
      "due_date",
      "status",
      "amount",
      "amount_paid",
      "balance",
      "days_overdue",
    ];
    const csvRows = rows.map((r) =>
      [
        r.id,
        r.client_name ?? r.client_id ?? "",
        r.invoice_date,
        r.due_date ?? "",
        r.status,
        r.amount.toFixed(2),
        r.paid.toFixed(2),
        r.balance.toFixed(2),
        r.days_overdue,
      ].join(","),
    );
    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ar_revenue.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">AR Revenue Report</h1>
      <div className="flex flex-wrap gap-4 items-end">
        <DateRangeFilter value={range} onChange={setRange} />
        <div>
          <label className="block text-sm font-medium" htmlFor="client">
            Client
          </label>
          <select
            id="client"
            className="border rounded px-2 py-1"
            value={client}
            onChange={(e) => setClient(e.target.value)}
          >
            <option value="">All</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <SZButton size="sm" onClick={exportCSV}>
          Export CSV
        </SZButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-3 rounded text-sm">
        <div>
          <div className="font-semibold">Total Billed</div>
          <div>${totals.billed.toFixed(2)}</div>
        </div>
        <div>
          <div className="font-semibold">Collected</div>
          <div>${totals.collected.toFixed(2)}</div>
        </div>
        <div>
          <div className="font-semibold">Outstanding</div>
          <div>${totals.outstanding.toFixed(2)}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(totals.buckets).map(([label, total]) => (
          <div key={label} className="bg-white shadow rounded p-4">
            <p className="text-sm text-gray-600">{label} days</p>
            <p className="text-lg font-semibold">${total.toFixed(2)}</p>
          </div>
        ))}
      </div>
      {loading && <GlobalLoading />}
      {error && <GlobalError message={error} />}
      {!loading && !error && rows.length === 0 && (
        <GlobalEmpty message="No invoices" />
      )}
      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto">
          <SZTable
            headers={[
              "Invoice",
              "Client",
              "Issued",
              "Due",
              "Status",
              "Amount",
              "Paid",
              "Balance",
              "Days Overdue",
            ]}
          >
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 border">{r.id}</td>
                <td className="p-2 border">{r.client_name ?? r.client_id}</td>
                <td className="p-2 border">
                  {new Date(r.invoice_date).toLocaleDateString()}
                </td>
                <td className="p-2 border">
                  {r.due_date ? new Date(r.due_date).toLocaleDateString() : ""}
                </td>
                <td className="p-2 border">{r.status}</td>
                <td className="p-2 border text-right">
                  ${r.amount.toFixed(2)}
                </td>
                <td className="p-2 border text-right">${r.paid.toFixed(2)}</td>
                <td className="p-2 border text-right">
                  ${r.balance.toFixed(2)}
                </td>
                <td className="p-2 border text-right">{r.days_overdue}</td>
              </tr>
            ))}
          </SZTable>
        </div>
      )}
    </div>
  );
};

export default ARRevenueReportPage;
