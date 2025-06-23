import React, { useMemo, useState } from "react";
import useJobs from "../../lib/hooks/useJobs";
import useInstallers from "../../lib/hooks/useInstallers";
import { JobCalendar, JobEvent } from "../../components/calendar/JobCalendar";
import { useAuth } from "../../lib/hooks/useAuth";
import { LoadingState } from "../../components/states";
import supabase from "../../lib/supabaseClient";

const CalendarPage: React.FC = () => {
  const { jobs, fetchJobs, loading } = useJobs();
  const { installers } = useInstallers();
  const { role } = useAuth();
  const [filter, setFilter] = useState<string>("all");

  const events = useMemo(() => {
    return jobs
      .filter((j) => filter === "all" || j.assigned_to === filter)
      .map<JobEvent>((j) => ({
        id: j.id,
        title: j.address,
        start: j.scheduled_date ? new Date(j.scheduled_date) : new Date(),
        end: j.scheduled_date ? new Date(j.scheduled_date) : new Date(),
        status: j.status,
        assignedTo: j.assigned_to,
      }));
  }, [jobs, filter]);

  const canEdit =
    role === "Manager" || role === "Install Manager" || role === "Admin";

  type Toast = { message: string; success: boolean } | null;
  const [toast, setToast] = useState<Toast>(null);

  const handleDrop = async (event: JobEvent, start: Date) => {
    const newDate = start.toISOString();
    const { error } = await supabase
      .from("jobs")
      .update({ scheduled_date: newDate })
      .eq("id", event.id);

    if (error) {
      setToast({
        message: "Rescheduling failed: " + error.message,
        success: false,
      });
    } else {
      setToast({ message: "Job rescheduled", success: true });
      await fetchJobs();
    }
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Job Schedule</h1>
        <div>
          <label htmlFor="installer" className="mr-2 text-sm font-medium">
            Filter Installer
          </label>
          <select
            id="installer"
            className="border rounded px-2 py-1"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            {installers.map((i) => (
              <option key={i.id} value={i.id}>
                {i.full_name || i.id}
              </option>
            ))}
          </select>
        </div>
      </header>
      {loading ? (
        <LoadingState />
      ) : (
        <JobCalendar
          events={events}
          editable={canEdit}
          onEventDrop={handleDrop}
        />
      )}
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
