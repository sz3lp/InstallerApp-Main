import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SZTable } from "../../components/ui/SZTable";
import { SZButton } from "../../components/ui/SZButton";
import { DateRangeFilter } from "../../components/ui/filters/DateRangeFilter";
import { useInstallers } from "../../lib/hooks/useInstallers";
import useInstallerPerformance, {
  InstallerPerformanceRow,
} from "../../lib/hooks/useInstallerPerformance";
import {
  GlobalLoading,
  GlobalError,
  GlobalEmpty,
} from "../../components/global-states";

function csvEscape(value: string | number | null) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

const InstallerPerformancePage: React.FC = () => {
  const today = new Date().toISOString().slice(0, 10);
  const past = new Date();
  past.setDate(past.getDate() - 30);
  const [range, setRange] = useState({
    start: past.toISOString().slice(0, 10),
    end: today,
  });
  const [installer, setInstaller] = useState("");
  const { installers } = useInstallers();
  const { rows, loading, error } = useInstallerPerformance(
    range.start,
    range.end,
    installer || undefined,
  );

  const exportCSV = () => {
    let csv = "Installer,Avg Duration,Callback Rate,Checklist Completion\n";
    rows.forEach((r) => {
      csv +=
        [
          csvEscape(r.installer_id),
          r.avg_duration?.toFixed(2),
          r.callback_rate?.toFixed(2),
          r.completion_rate?.toFixed(2),
        ].join(",") + "\n";
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "installer_performance.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartData = useMemo(() => {
    return rows.map((r) => ({
      installer: r.installer_id,
      duration: r.avg_duration ?? 0,
      callback: r.callback_rate ?? 0,
      completion: r.completion_rate ?? 0,
    }));
  }, [rows]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Installer Performance</h1>
      <div className="flex flex-wrap gap-4 items-end">
        <DateRangeFilter value={range} onChange={setRange} />
        <div>
          <label className="block text-sm font-medium" htmlFor="installer">
            Installer
          </label>
          <select
            id="installer"
            className="border rounded px-2 py-1"
            value={installer}
            onChange={(e) => setInstaller(e.target.value)}
          >
            <option value="">All</option>
            {installers.map((i) => (
              <option key={i.id} value={i.id}>
                {i.full_name ?? i.id}
              </option>
            ))}
          </select>
        </div>
        <SZButton size="sm" onClick={exportCSV}>
          Export CSV
        </SZButton>
      </div>
      {loading && <GlobalLoading />}
      {error && <GlobalError message={error} />}
      {!loading && !error && rows.length === 0 && (
        <GlobalEmpty message="No performance data" />
      )}
      {!loading && !error && rows.length > 0 && (
        <>
          <div className="h-72 bg-white p-4 rounded shadow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <XAxis dataKey="installer" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="duration" fill="#8884d8" name="Avg Duration" />
                <Bar dataKey="callback" fill="#82ca9d" name="Callback Rate" />
                <Bar
                  dataKey="completion"
                  fill="#f87171"
                  name="Checklist Completion"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <SZTable
              headers={[
                "Installer",
                "Avg Duration",
                "Callback %",
                "Checklist %",
              ]}
            >
              {rows.map((r) => (
                <tr key={r.installer_id} className="border-t">
                  <td className="p-2 border">{r.installer_id}</td>
                  <td className="p-2 border text-right">
                    {r.avg_duration?.toFixed(2) ?? ""}
                  </td>
                  <td className="p-2 border text-right">
                    {r.callback_rate?.toFixed(2) ?? ""}
                  </td>
                  <td className="p-2 border text-right">
                    {r.completion_rate?.toFixed(2) ?? ""}
                  </td>
                </tr>
              ))}
            </SZTable>
          </div>
        </>
      )}
    </div>
  );
};

export default InstallerPerformancePage;
