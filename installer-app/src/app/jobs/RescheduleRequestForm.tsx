import React, { useState } from "react";
import { SZInput } from "../../components/ui/SZInput";
import { SZTextarea } from "../../components/ui/SZTextarea";
import { SZButton } from "../../components/ui/SZButton";
import useAuth from "../../lib/hooks/useAuth";
import useRescheduleRequests from "../../lib/hooks/useRescheduleRequests";

interface Props {
  jobId: string;
}

const RescheduleRequestForm: React.FC<Props> = ({ jobId }) => {
  const { role } = useAuth();
  const { requests, createRequest, updateStatus } =
    useRescheduleRequests(jobId);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!date) {
      setError("Requested date is required");
      return;
    }
    setSubmitting(true);
    try {
      await createRequest(date, reason);
      setDate("");
      setReason("");
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
    setSubmitting(false);
  };

  const approve = async (id: string, newDate: string) => {
    try {
      await updateStatus(id, "approved", newDate);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deny = async (id: string) => {
    try {
      await updateStatus(id, "denied");
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-4">
      {role === "Sales" && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Request Reschedule</h3>
          <SZInput
            id="req_date"
            label="New Date"
            type="date"
            value={date}
            onChange={setDate}
          />
          <SZTextarea
            id="req_reason"
            label="Reason"
            value={reason}
            onChange={setReason}
            rows={3}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <SZButton
            onClick={submit}
            isLoading={submitting}
            disabled={submitting}
          >
            Submit Request
          </SZButton>
        </div>
      )}

      {role === "Manager" && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Reschedule Requests</h3>
          {requests.length === 0 ? (
            <p className="text-sm text-gray-600">No requests.</p>
          ) : (
            <ul className="space-y-2">
              {requests.map((r) => (
                <li key={r.id} className="border rounded p-2 space-y-1">
                  <p className="text-sm">
                    Requested Date:{" "}
                    {new Date(r.requested_date).toLocaleDateString()}
                  </p>
                  {r.reason && <p className="text-sm italic">{r.reason}</p>}
                  <p className="text-sm font-semibold">Status: {r.status}</p>
                  {r.status === "pending" && (
                    <div className="flex gap-2 mt-2">
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
                </li>
              ))}
            </ul>
          )}
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default RescheduleRequestForm;
