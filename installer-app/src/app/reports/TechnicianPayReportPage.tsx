import React, { useMemo, useState } from "react";
import { DateRangeFilter } from "../../components/ui/filters/DateRangeFilter";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import {
  GlobalLoading,
  GlobalEmpty,
  GlobalError,
} from "../../components/global-states";
import useTechnicianPayReport, {
  PayLine,
} from "../../lib/hooks/useTechnicianPayReport";
import { useInstallers } from "../../lib/hooks/useInstallers";

function csvEscape(value: string | number | null) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

const TechnicianPayReportPage: React.FC = () => {
  const today = new Date().toISOString().slice(0, 10);
  const past = new Date();
  past.setDate(past.getDate() - 30);
  const [range, setRange] = useState({
    start: past.toISOString().slice(0, 10),
    end: today,
  });
  const [tech, setTech] = useState("");
  const { installers } = useInstallers();
  const { lines, loading, error } = useTechnicianPayReport(
    range.start,
    range.end,
    tech || undefined,
  );

  const grouped = useMemo(() => {
    const result: Record<
      string,
      {
        name: string;
        jobs: Record<
          string,
          {
            name: string;
            client: string | null;
            date: string | null;
            lines: PayLine[];
            total: number;
          }
        >;
        total: number;
      }
    > = {};
    lines.forEach((l) => {
      const techEntry = result[l.user_id] || {
        name: l.user_name ?? l.user_id,
        jobs: {},
        total: 0,
      };
      result[l.user_id] = techEntry;
      const job = techEntry.jobs[l.job_id] || {
        name: l.job_name ?? l.job_id,
        client: l.client_name,
        date: l.completed_at,
        lines: [],
        total: 0,
      };
      techEntry.jobs[l.job_id] = job;
      job.lines.push(l);
      job.total += l.subtotal;
      techEntry.total += l.subtotal;
    });
    return result;
  }, [lines]);

  const summary = useMemo(() => {
    let pay = 0;
    let jobs = 0;
    Object.values(grouped).forEach((t) => {
      pay += t.total;
      jobs += Object.keys(t.jobs).length;
    });
    return { pay, jobs, techs: Object.keys(grouped).length };
  }, [grouped]);

  const exportCSV = () => {
    let csv =
      "Technician,Job,Client,Completed,Material,Quantity,Rate,Subtotal\n";
    lines.forEach((l) => {
      csv +=
        [
          csvEscape(l.user_name),
          csvEscape(l.job_name),
          csvEscape(l.client_name),
          csvEscape(
            l.completed_at ? new Date(l.completed_at).toLocaleDateString() : "",
          ),
          csvEscape(l.material_name),
          l.quantity,
          l.rate,
          l.subtotal,
        ].join(",") + "\n";
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "technician_pay.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Technician Pay Report</h1>
      <div className="flex flex-wrap gap-4 items-end">
        <DateRangeFilter value={range} onChange={setRange} />
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="tech"
          >
            Technician
          </label>
          <select
            id="tech"
            className="border rounded px-2 py-1"
            value={tech}
            onChange={(e) => setTech(e.target.value)}
          >
            <option value="">All</option>
            {installers.map((i) => (
              <option key={i.id} value={i.id}>
                {i.full_name}
              </option>
            ))}
          </select>
        </div>
        <SZButton size="sm" onClick={exportCSV}>
          Export CSV
        </SZButton>
        <SZButton size="sm" variant="secondary" onClick={() => window.print()}>
          PDF / Print
        </SZButton>
      </div>
      <div className="bg-gray-50 p-3 rounded">
        <p>Total Pay: ${summary.pay.toFixed(2)}</p>
        <p>Total Jobs: {summary.jobs}</p>
        <p>Installers: {summary.techs}</p>
      </div>
      {loading && <GlobalLoading />}
      {error && <GlobalError message={error} />}
      {!loading && !error && lines.length === 0 && (
        <GlobalEmpty message="No pay records found for the selected period." />
      )}
      {!loading &&
        !error &&
        Object.keys(grouped).map((tid) => {
          const tech = grouped[tid];
          return (
            <div key={tid} className="space-y-2">
              <h2 className="text-xl font-semibold mt-4">{tech.name}</h2>
              {Object.keys(tech.jobs).map((jid) => {
                const job = tech.jobs[jid];
                return (
                  <div key={jid} className="mb-4 overflow-x-auto">
                    <h3 className="font-semibold mb-1">
                      {job.name} - {job.client || ""} -{" "}
                      {job.date ? new Date(job.date).toLocaleDateString() : ""}
                    </h3>
                    <SZTable headers={["Material", "Qty", "Rate", "Subtotal"]}>
                      {job.lines.map((line, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2 border">{line.material_name}</td>
                          <td className="p-2 border text-right">
                            {line.quantity}
                          </td>
                          <td className="p-2 border text-right">
                            ${line.rate.toFixed(2)}
                          </td>
                          <td className="p-2 border text-right">
                            ${line.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t font-semibold">
                        <td className="p-2 border" colSpan={3}>
                          Job Total
                        </td>
                        <td className="p-2 border text-right">
                          ${job.total.toFixed(2)}
                        </td>
                      </tr>
                    </SZTable>
                  </div>
                );
              })}
              <div className="font-bold">
                Technician Total: ${tech.total.toFixed(2)}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default TechnicianPayReportPage;
