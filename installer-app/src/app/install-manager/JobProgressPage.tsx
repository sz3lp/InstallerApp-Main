import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { SZTable } from "../../components/ui/SZTable";
import { SZButton } from "../../components/ui/SZButton";
import DateRangeFilter, {
  DateRange,
} from "../../components/ui/filters/DateRangeFilter";
import { useInstallers } from "../../lib/hooks/useInstallers";
import { useAuth } from "../../lib/hooks/useAuth";
import supabase from "../../lib/supabaseClient";
import {
  GlobalLoading,
  GlobalEmpty,
  GlobalError,
} from "../../components/global-states";

interface JobRow {
  id: string;
  status: string;
  assigned_to: string | null;
  last_updated: string;
}

const JobProgressPage: React.FC = () => {
  const { role, loading: authLoading } = useAuth();
  const { installers } = useInstallers();

  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installer, setInstaller] = useState("");
  const [range, setRange] = useState<DateRange>({ start: "", end: "" });

  const fetchJobs = async () => {
    setError(null);
    const { data, error } = await supabase
      .from<JobRow>("jobs")
      .select("id, status, assigned_to, last_updated");
    if (error) {
      setError(error.message);
      setJobs([]);
    } else {
      setJobs(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
    const id = setInterval(fetchJobs, 10000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (installer && j.assigned_to !== installer) return false;
      if (range.start && new Date(j.last_updated) < new Date(range.start)) {
        return false;
      }
      if (range.end) {
        const end = new Date(range.end);
        end.setHours(23, 59, 59, 999);
        if (new Date(j.last_updated) > end) return false;
      }
      return true;
    });
  }, [jobs, installer, range]);

  if (authLoading) return <GlobalLoading />;
  if (role !== "Install Manager" && role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  if (loading) return <GlobalLoading />;
  if (error) return <GlobalError message={error} onRetry={fetchJobs} />;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Job Progress</h1>
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label
            htmlFor="installer"
            className="block text-sm font-medium text-gray-700"
          >
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
                {i.full_name || i.id}
              </option>
            ))}
          </select>
        </div>
        <DateRangeFilter value={range} onChange={setRange} />
        <SZButton size="sm" variant="secondary" onClick={fetchJobs}>
          Refresh
        </SZButton>
      </div>
      {filtered.length === 0 ? (
        <GlobalEmpty message="No jobs found." />
      ) : (
        <div className="overflow-x-auto">
          <SZTable headers={["ID", "Status", "Installer", "Last Updated"]}>
            {filtered.map((job) => (
              <tr key={job.id} className="border-t">
                <td className="p-2 border">
                  <a
                    href={`/jobs/${job.id}`}
                    className="text-blue-600 underline"
                  >
                    {job.id}
                  </a>
                </td>
                <td className="p-2 border">{job.status}</td>
                <td className="p-2 border">
                  {job.assigned_to ? job.assigned_to : "Unassigned"}
                </td>
                <td className="p-2 border">
                  {new Date(job.last_updated).toLocaleString()}
                </td>
              </tr>
            ))}
          </SZTable>
        </div>
      )}
    </div>
  );
};

export default JobProgressPage;
