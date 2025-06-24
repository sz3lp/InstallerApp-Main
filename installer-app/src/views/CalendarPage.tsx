import React, { useMemo, useState, useEffect } from "react";
import { JobCalendar, JobEvent } from "../components/calendar/JobCalendar";
import { SZModal } from "../components/ui/SZModal";
import { SZButton } from "../components/ui/SZButton";
import EmptyState from "../components/ui/EmptyState";
import { LoadingState } from "../components/states";
import useJobs from "../lib/hooks/useJobs";
import { useAuth } from "../lib/hooks/useAuth";

interface PendingMove {
  id: string;
  start: Date;
  end: Date;
  title: string;
}

const CalendarPage: React.FC = () => {
  const { role } = useAuth();
  const { jobs, loading, updateJob } = useJobs();
  const [pending, setPending] = useState<PendingMove | null>(null);
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const events = useMemo<JobEvent[]>(
    () =>
      jobs
        .filter((j) => j.scheduled_date)
        .map((j) => {
          const start = new Date(j.scheduled_date as string);
          const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
          return {
            id: j.id,
            title: j.client_name ?? j.address,
            start,
            end,
            status: j.status,
            assignedTo: j.assigned_to,
          } as JobEvent;
        }),
    [jobs],
  );

  const handleDrop = ({ event, start, end }: { event: JobEvent; start: Date; end: Date }) => {
    setPending({ id: event.id, start, end, title: event.title });
  };

  const confirmMove = async () => {
    if (!pending) return;
    try {
      await updateJob(pending.id, { scheduled_date: pending.start.toISOString() });
      setToast({ message: "Job rescheduled", success: true });
    } catch (err) {
      setToast({ message: "Failed to update job schedule", success: false });
    }
    setPending(null);
  };

  const canEdit = role === "Admin" || role === "Install Manager";

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Job Schedule</h1>
      {loading ? (
        <LoadingState />
      ) : events.length === 0 ? (
        <EmptyState message="No jobs scheduled this week." />
      ) : (
        <JobCalendar events={events} editable={canEdit} onEventDrop={canEdit ? handleDrop : undefined} />
      )}
      <SZModal isOpen={!!pending} onClose={() => setPending(null)} title="Confirm Reschedule">
        <p>Reschedule this job to {pending?.start.toLocaleString()}?</p>
        <div className="mt-4 flex justify-end gap-2">
          <SZButton variant="secondary" onClick={() => setPending(null)}>
            Cancel
          </SZButton>
          <SZButton onClick={confirmMove}>Confirm</SZButton>
        </div>
      </SZModal>
      {toast && (
        <div
          className={`fixed top-4 right-4 text-white px-4 py-2 rounded ${toast.success ? "bg-green-600" : "bg-red-600"}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
