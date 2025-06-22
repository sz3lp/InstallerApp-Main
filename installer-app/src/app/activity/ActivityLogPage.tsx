import React, { useState } from "react";
import { SZTable } from "../../components/ui/SZTable";
import { SZInput } from "../../components/ui/SZInput";
import { useAuth } from "../../lib/hooks/useAuth";
import useActivityLog from "../../lib/hooks/useActivityLog";
import JobStatusBadge from "../../components/JobStatusBadge";

const ActivityLogPage: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { jobs, loading } = useActivityLog(
    userId,
    startDate || undefined,
    endDate || undefined,
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString();

  const formatDuration = (start: string, end?: string | null) => {
    if (!end) return "-";
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.round(ms / 60000);
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return hrs > 0 ? `${hrs}h ${rem}m` : `${rem}m`;
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Activity Log</h1>
      <div className="flex gap-4">
        <SZInput
          id="start_date"
          type="date"
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
        />
        <SZInput
          id="end_date"
          type="date"
          label="End Date"
          value={endDate}
          onChange={setEndDate}
        />
      </div>
      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <SZTable
          headers={["Job ID", "Client", "Date Completed", "Duration", "Status"]}
        >
          {jobs.map((j) => (
            <tr key={j.id} className="border-t">
              <td className="p-2 border">{j.id}</td>
              <td className="p-2 border">{j.client_name}</td>
              <td className="p-2 border">
                {j.completed_at ? formatDate(j.completed_at) : "-"}
              </td>
              <td className="p-2 border">
                {formatDuration(j.created_at, j.completed_at)}
              </td>
              <td className="p-2 border">
                <JobStatusBadge status={j.status as any} />
              </td>
            </tr>
          ))}
        </SZTable>
      )}
    </div>
  );
};

export default ActivityLogPage;
