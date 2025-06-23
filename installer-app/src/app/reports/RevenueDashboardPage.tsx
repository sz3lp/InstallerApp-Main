import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { GlobalLoading, GlobalError, GlobalEmpty } from "../../components/global-states";
import useRevenueByMonth, { RevenueByMonthRow } from "../../lib/hooks/useRevenueByMonth";
import { SZTable } from "../../components/ui/SZTable";

const RevenueDashboardPage: React.FC = () => {
  const data = useRevenueByMonth();
  const loading = false; // hook doesn't expose loading, assume immediate
  const error = null;
  const [sort, setSort] = useState<{ key: keyof RevenueByMonthRow; dir: "asc" | "desc" }>({
    key: "month",
    dir: "desc",
  });

  const rows = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const av = a[sort.key] as any;
      const bv = b[sort.key] as any;
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sort]);

  const thisMonth = useMemo(() => {
    const key = new Date().toISOString().slice(0, 7);
    return rows.find((r) => r.month.startsWith(key));
  }, [rows]);

  const lastMonth = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    const key = d.toISOString().slice(0, 7);
    return rows.find((r) => r.month.startsWith(key));
  }, [rows]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        invoiced: acc.invoiced + Number(r.total_invoiced || 0),
        paid: acc.paid + Number(r.total_paid || 0),
        due: acc.due + Number(r.outstanding_balance || 0),
      }),
      { invoiced: 0, paid: 0, due: 0 },
    );
  }, [rows]);

  const thisMonthRevenue = thisMonth?.total_paid ?? 0;
  const lastMonthRevenue = lastMonth?.total_paid ?? 0;
  const revenueChange = thisMonthRevenue - lastMonthRevenue;

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white shadow rounded p-4">
              <p className="text-sm text-gray-600">Revenue This Month</p>
              <p className="text-lg font-semibold">${thisMonthRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500">
                Prev Month: ${lastMonthRevenue.toFixed(2)}
                {revenueChange !== 0 && (
                  <span className={revenueChange > 0 ? "text-green-600" : "text-red-600"}>
                    {revenueChange > 0 ? " ▲" : " ▼"}
                    {Math.abs(revenueChange).toFixed(2)}
                  </span>
                )}
              </p>
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
                <Line
                  type="monotone"
                  dataKey="outstanding_balance"
                  stroke="#f87171"
                  name="Outstanding"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <SZTable headers={["Month", "Invoiced", "Paid", "Outstanding"]}>
              {rows.map((r) => (
                <tr key={r.month} className="border-t">
                  <td
                    className="p-2 border cursor-pointer"
                    onClick={() =>
                      setSort((s) => ({
                        key: "month",
                        dir: s.dir === "asc" ? "desc" : "asc",
                      }))
                    }
                  >
                    {new Date(r.month).toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-2 border text-right">${r.total_invoiced.toFixed(2)}</td>
                  <td className="p-2 border text-right">${r.total_paid.toFixed(2)}</td>
                  <td className="p-2 border text-right">${r.outstanding_balance.toFixed(2)}</td>
                </tr>
              ))}
            </SZTable>
          </div>
        </>
      )}
    </div>
  );
};

export default RevenueDashboardPage;
