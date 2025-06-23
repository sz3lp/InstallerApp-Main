import React, { useEffect, useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import supabase from "../../lib/supabaseClient";
import { GlobalLoading, GlobalError, GlobalEmpty } from "../../components/global-states";

interface RevenueRow {
  month: string;
  invoice_count: number;
  total_invoiced: number;
  total_paid: number;
  outstanding: number;
}

const RevenueDashboardPage: React.FC = () => {
  const [rows, setRows] = useState<RevenueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("revenue_by_month")
        .select("*")
        .order("month", { ascending: true });
      if (error) {
        console.error(error);
        setError(error.message);
        setRows([]);
      } else {
        setRows(data as RevenueRow[]);
        setError(null);
      }
      setLoading(false);
    }
    load();
  }, []);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        invoiced: acc.invoiced + Number(r.total_invoiced || 0),
        paid: acc.paid + Number(r.total_paid || 0),
        due: acc.due + Number(r.outstanding || 0),
      }),
      { invoiced: 0, paid: 0, due: 0 },
    );
  }, [rows]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Revenue Dashboard</h1>
      {loading && <GlobalLoading />}
      {error && <GlobalError message={error} />}
      {!loading && !error && rows.length === 0 && (
        <GlobalEmpty message="No revenue data" />
      )}
      {!loading && !error && rows.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white shadow rounded p-4">
              <p className="text-sm text-gray-600">Total Invoiced</p>
              <p className="text-lg font-semibold">${totals.invoiced.toFixed(2)}</p>
            </div>
            <div className="bg-white shadow rounded p-4">
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-lg font-semibold">${totals.paid.toFixed(2)}</p>
            </div>
            <div className="bg-white shadow rounded p-4">
              <p className="text-sm text-gray-600">Outstanding Balance</p>
              <p className="text-lg font-semibold">${totals.due.toFixed(2)}</p>
            </div>
          </div>
          <div className="h-96 bg-white p-4 rounded shadow">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <XAxis dataKey="month" tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", year: "numeric" })} />
                <YAxis />
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} labelFormatter={(l) => new Date(l).toLocaleDateString(undefined, { month: "short", year: "numeric" })} />
                <Legend />
                <Line type="monotone" dataKey="total_invoiced" stroke="#8884d8" name="Invoiced" />
                <Line type="monotone" dataKey="total_paid" stroke="#82ca9d" name="Paid" />
                <Line type="monotone" dataKey="outstanding" stroke="#f87171" name="Outstanding" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default RevenueDashboardPage;
