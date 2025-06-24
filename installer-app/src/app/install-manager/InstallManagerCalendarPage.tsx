import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import useJobs from "../../lib/hooks/useJobs";
import { useAuth } from "../../lib/hooks/useAuth";
import { LoadingState } from "../../components/states";
import supabase from "../../lib/supabaseClient";

const statusColors: Record<string, string> = {
  assigned: "#3b82f6",
  in_progress: "#f59e0b",
  needs_qa: "#f97316",
  complete: "#10b981",
  rework: "#ef4444",
};

const InstallManagerCalendarPage: React.FC = () => {
  const { jobs, loading, updateScheduledDate } = useJobs();
  const { role } = useAuth();

  const canEdit = role === "Install Manager" || role === "Admin";

  const events = useMemo(
    () =>
      jobs
        .filter((j) => j.scheduled_date)
        .map((j) => ({
          id: j.id,
          title: j.client_name ?? j.address,
          start: j.scheduled_date as string,
          backgroundColor: statusColors[j.status] || "#6b7280",
          borderColor: statusColors[j.status] || "#6b7280",
          extendedProps: { installerId: j.assigned_to },
        })),
    [jobs],
  );

  const handleDrop = async ({ event }: any) => {
    const newDate = event.start;
    await updateScheduledDate(event.id, newDate.toISOString());
    const installerId = event.extendedProps.installerId;
    if (installerId) {
      await supabase.from("notifications").insert({
        user_id: installerId,
        message: `Job ${event.title} rescheduled to ${newDate.toLocaleString()}`,
      });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Schedule Calendar</h1>
      {loading ? (
        <LoadingState />
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          editable={canEdit}
          events={events}
          eventDrop={canEdit ? handleDrop : undefined}
        />
      )}
    </div>
  );
};

export default InstallManagerCalendarPage;
