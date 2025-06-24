import React, { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import { LoadingState } from "../../components/states";
import useJobs from "../../lib/hooks/useJobs";
import useInstallers from "../../lib/hooks/useInstallers";
import supabase from "../../lib/supabaseClient";

interface Schedule {
  id: string;
  installer_id: string;
  start_time: string;
  end_time: string;
  type: string;
}

const statusColors: Record<string, string> = {
  assigned: "#3b82f6",
  in_progress: "#f59e0b",
  needs_qa: "#f97316",
  complete: "#10b981",
  rework: "#ef4444",
};

const UnifiedDispatchCalendar: React.FC = () => {
  const { jobs, loading, fetchJobs, updateJob } = useJobs();
  const { installers } = useInstallers();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [techFilter, setTechFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assignTech, setAssignTech] = useState<string>("");
  const unassignedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      const { data } = await supabase
        .from("schedules")
        .select("id, installer_id, start_time, end_time, type");
      setSchedules((data as any[]) ?? []);
    };
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (unassignedRef.current) {
      new Draggable(unassignedRef.current, {
        itemSelector: ".fc-job",
        eventData: function (el) {
          return {
            id: el.getAttribute("data-id") as string,
            title: el.getAttribute("data-title") as string,
          };
        },
      });
    }
  }, [jobs]);

  useEffect(() => {
    const channel = supabase.channel("unified_dispatch_calendar");
    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        () => fetchJobs(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchJobs]);

  const unassignedJobs = useMemo(
    () => jobs.filter((j) => !j.assigned_to),
    [jobs],
  );

  const scheduledJobs = useMemo(
    () =>
      jobs.filter((j) => {
        if (!j.scheduled_date) return false;
        if (techFilter !== "all" && j.assigned_to !== techFilter) return false;
        if (statusFilter !== "all" && j.status !== statusFilter) return false;
        return true;
      }),
    [jobs, techFilter, statusFilter],
  );

  const checkConflict = (
    jobId: string,
    technicianId: string | null,
    start: Date | null,
  ): boolean => {
    if (!technicianId || !start) return false;
    const startTime = start.getTime();
    const endTime = startTime + 2 * 60 * 60 * 1000; // assume 2h job window
    return jobs.some((j) => {
      if (j.id === jobId || j.assigned_to !== technicianId || !j.scheduled_date)
        return false;
      const otherStart = new Date(j.scheduled_date).getTime();
      const otherEnd = otherStart + 2 * 60 * 60 * 1000;
      return otherStart < endTime && startTime < otherEnd;
    });
  };

  const events = useMemo(
    () =>
      scheduledJobs.map((j) => ({
        id: j.id,
        title: j.client_name ?? j.address,
        start: j.scheduled_date as string,
        backgroundColor: statusColors[j.status] || "#6b7280",
        borderColor: statusColors[j.status] || "#6b7280",
        extendedProps: { technicianId: j.assigned_to },
      })),
    [scheduledJobs],
  );

  const scheduleBackgroundEvents = useMemo(
    () =>
      schedules.map((s) => ({
        id: `sched-${s.id}`,
        start: s.start_time,
        end: s.end_time,
        display: "background",
        backgroundColor: s.type === "time_off" ? "#fecaca" : "#d1fae5",
      })),
    [schedules],
  );

  const handleDrop = async ({ event }: any) => {
    const technicianId = event.extendedProps.technicianId as string | null;
    const date = event.start as Date;
    if (checkConflict(event.id, technicianId, date)) {
      alert("Technician double-booked");
      event.revert();
      return;
    }
    await updateJob(event.id, { scheduled_date: date.toISOString() });
  };

  const handleReceive = async ({ event }: any) => {
    const jobId = event.id as string;
    const date = event.start as Date;
    if (!assignTech) {
      alert("Select technician to assign");
      event.remove();
      return;
    }
    if (checkConflict(jobId, assignTech, date)) {
      alert("Technician double-booked");
      event.remove();
      return;
    }
    await updateJob(jobId, {
      scheduled_date: date.toISOString(),
      assigned_to: assignTech,
      status: "assigned",
    });
    fetchJobs();
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Dispatch Calendar</h1>
      <div className="flex space-x-4 items-center">
        <label className="text-sm">Filter Tech:</label>
        <select
          className="border rounded px-2 py-1"
          value={techFilter}
          onChange={(e) => setTechFilter(e.target.value)}
        >
          <option value="all">All</option>
          {installers.map((i) => (
            <option key={i.id} value={i.id}>
              {i.full_name || i.id}
            </option>
          ))}
        </select>
        <label className="text-sm">Status:</label>
        <select
          className="border rounded px-2 py-1"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          {Object.keys(statusColors).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <label className="text-sm">Assign Tech:</label>
        <select
          className="border rounded px-2 py-1"
          value={assignTech}
          onChange={(e) => setAssignTech(e.target.value)}
        >
          <option value="">--select--</option>
          {installers.map((i) => (
            <option key={i.id} value={i.id}>
              {i.full_name || i.id}
            </option>
          ))}
        </select>
      </div>
      <div className="flex space-x-4">
        <div className="w-1/4">
          <h2 className="font-medium mb-2">Unassigned Jobs</h2>
          <div ref={unassignedRef} className="space-y-2">
            {unassignedJobs.map((job) => (
              <div
                key={job.id}
                className="fc-job p-2 border rounded cursor-grab bg-gray-100"
                data-id={job.id}
                data-title={job.client_name ?? job.address}
              >
                {job.client_name ?? job.address}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1">
          {loading ? (
            <LoadingState />
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              droppable={true}
              editable={true}
              events={[...events, ...scheduleBackgroundEvents]}
              eventDrop={handleDrop}
              eventReceive={handleReceive}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedDispatchCalendar;
