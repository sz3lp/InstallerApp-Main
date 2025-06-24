import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DateRangeFilter } from "../../components/ui/filters/DateRangeFilter";
import { SZTable } from "../../components/ui/SZTable";
import {
  GlobalLoading,
  GlobalError,
  GlobalEmpty,
} from "../../components/global-states";
import useInstallTimeReport from "../../lib/hooks/useInstallTimeReport";

const InstallTimeReportPage: React.FC = () => {
  const today = new Date().toISOString().slice(0, 10);
  const past = new Date();
  past.setDate(past.getDate() - 30);
  const [range, setRange] = useState({
    start: past.toISOString().slice(0, 10),
    end: today,
  });
  const { rows, loading, error } = useInstallTimeReport(range.start, range.end);

  const chartData = useMemo(
    () =>
      rows.map((r) => ({
        rooms: r.room_count ?? 0,
        duration: r.avg_duration ?? 0,
      })),
    [rows],
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Install Time by Room Count</h1>
      <DateRangeFilter value={range} onChange={setRange} />
      {loading && <GlobalLoading />}
      {error && <GlobalError message={error} />}
      {!loading && !error && rows.length === 0 && (
        <GlobalEmpty message="No data" />
      )}
      {!loading && !error && rows.length > 0 && (
        <>
          <div className="h-72 bg-white p-4 rounded shadow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <XAxis dataKey="rooms" label={{ value: "Rooms", position: "insideBottom", offset: -5 }} />
                <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Bar dataKey="duration" fill="#8884d8" name="Avg Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <SZTable headers={["Rooms", "Avg Hours"]}>
              {rows.map((r) => (
                <tr key={r.room_count ?? "none"} className="border-t">
                  <td className="p-2 border">{r.room_count}</td>
                  <td className="p-2 border text-right">
                    {r.avg_duration?.toFixed(2) ?? ""}
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

export default InstallTimeReportPage;
