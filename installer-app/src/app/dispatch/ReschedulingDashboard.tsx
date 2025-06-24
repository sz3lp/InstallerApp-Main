import React, { useState } from "react";
import useAllRescheduleRequests from "../../lib/hooks/useAllRescheduleRequests";
import LoadingFallback from "../../components/ui/LoadingFallback";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBoundary from "../../components/ui/ErrorBoundary";
import { SZTable } from "../../components/ui/SZTable";
import InstallerSelector from "../../components/filters/InstallerSelector";
import StatusFilter from "../../components/filters/StatusFilter";
import { SZButton } from "../../components/ui/SZButton";

const ReschedulingDashboard: React.FC = () => {
  const [status, setStatus] = useState<string>("pending");
  const [installer, setInstaller] = useState<string>("");
  const { requests, loading, error, updateStatus } = useAllRescheduleRequests({
    status,
    installerId: installer,
  });

  const approve = (id: string, date: string) => {
    updateStatus(id, "approved", date);
  };

  const deny = (id: string) => {
    updateStatus(id, "denied");
  };

  return (
    <ErrorBoundary>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Reschedule Requests</h1>
        <div className="flex gap-4">
          <StatusFilter
            options={[
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "denied", label: "Denied" },
            ]}
            value={status}
            onChange={setStatus}
          />
          <InstallerSelector value={installer} onChange={setInstaller} />
        </div>
        {loading ? (
          <LoadingFallback />
        ) : error ? (
          <EmptyState message="Failed to load requests." />
        ) : requests.length === 0 ? (
          <EmptyState message="No reschedule requests found." />
        ) : (
          <SZTable
            headers={[
              "Job",
              "Current Date",
              "Requested Date",
              "Reason",
              "Status",
              "Actions",
            ]}
          >
            {requests.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 border">
                  {r.jobs?.clinic_name || r.job_id}
                </td>
                <td className="p-2 border">
                  {r.jobs?.scheduled_date
                    ? new Date(r.jobs.scheduled_date).toLocaleDateString()
                    : ""}
                </td>
                <td className="p-2 border">
                  {new Date(r.requested_date).toLocaleDateString()}
                </td>
                <td className="p-2 border">{r.reason}</td>
                <td className="p-2 border">{r.status}</td>
                <td className="p-2 border">
                  {r.status === "pending" && (
                    <div className="flex gap-2">
                      <SZButton
                        size="sm"
                        onClick={() => approve(r.id, r.requested_date)}
                      >
                        Approve
                      </SZButton>
                      <SZButton
                        size="sm"
                        variant="destructive"
                        onClick={() => deny(r.id)}
                      >
                        Deny
                      </SZButton>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </SZTable>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ReschedulingDashboard;
