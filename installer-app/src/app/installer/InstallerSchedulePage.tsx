import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../lib/hooks/useAuth";
import supabase from "../../lib/supabaseClient";
import { JobCalendar, JobEvent } from "../../components/calendar/JobCalendar";
import { LoadingState } from "../../components/states";
import EmptyState from "../../components/ui/EmptyState";
import { SZButton } from "../../components/ui/SZButton";

interface ScheduleEvent extends JobEvent {
  location: string | null;
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]|\.\d{3}/g, "").slice(0, 15) + "Z";
}

function eventsToICS(events: ScheduleEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SentientZone//InstallerSchedule//EN",
  ];
  for (const e of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${e.id}@sentientzone`);
    lines.push(`DTSTAMP:${formatICSDate(new Date())}`);
    lines.push(`DTSTART:${formatICSDate(e.start)}`);
    lines.push(`DTEND:${formatICSDate(e.end)}`);
    lines.push(`SUMMARY:${e.title}`);
    if (e.location) lines.push(`LOCATION:${e.location}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export default function InstallerSchedulePage() {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancel = false;
    const fetchJobs = async () => {
      const { data } = await supabase
        .from("jobs")
        .select(
          "id, clinic_name, address, scheduled_date, status, assigned_to"
        )
        .eq("assigned_to", userId)
        .not("status", "eq", "canceled");
      if (cancel) return;
      const list: ScheduleEvent[] = (data ?? []).map((j: any) => {
        const start = j.scheduled_date ? new Date(j.scheduled_date) : new Date();
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
        return {
          id: j.id,
          title: j.clinic_name ?? j.address,
          start,
          end,
          status: j.status,
          assignedTo: j.assigned_to,
          location: j.address ?? null,
        } as ScheduleEvent;
      });
      setEvents(list);
      setLoading(false);
    };
    fetchJobs();

    const channel = supabase.channel(`installer_schedule_${userId}`);
    channel
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "jobs", filter: `assigned_to=eq.${userId}` },
        (payload) => {
          const row = payload.new as any;
          setEvents((ev) => {
            if (row.status === "canceled") {
              return ev.filter((e) => e.id !== row.id);
            }
            const start = row.scheduled_date ? new Date(row.scheduled_date) : new Date();
            const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
            const event: ScheduleEvent = {
              id: row.id,
              title: row.clinic_name ?? row.address,
              start,
              end,
              status: row.status,
              assignedTo: row.assigned_to,
              location: row.address ?? null,
            };
            const existing = ev.some((e) => e.id === row.id);
            return existing ? ev.map((e) => (e.id === row.id ? event : e)) : [...ev, event];
          });
        }
      )
      .subscribe();
    return () => {
      cancel = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const calendarEvents = useMemo<JobEvent[]>(() => events.map(({ location, ...e }) => e), [events]);

  const exportICS = () => {
    const ics = eventsToICS(events);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Schedule</h1>
        <SZButton onClick={exportICS}>Export ICS</SZButton>
      </div>
      {loading ? (
        <LoadingState />
      ) : calendarEvents.length === 0 ? (
        <EmptyState message="No upcoming jobs." />
      ) : (
        <JobCalendar events={calendarEvents} editable={false} />
      )}
    </div>
  );
}
