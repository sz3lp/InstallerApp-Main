import React, { useEffect, useRef, useState } from "react";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import supabase from "../../lib/supabaseClient";
import useAuth from "../../lib/hooks/useAuth";

interface TimeTrackingPanelProps {
  jobId: string;
}

interface TimeEntry {
  id: string;
  job_id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  users: { full_name: string | null; email: string | null } | null;
}

const MAX_RETRIES = 5;

function formatLocal(dt: string) {
  return new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function calcDuration(start: string, end: string | null) {
  if (!end) return "";
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const hours = diff / 3600000;
  return `${hours.toFixed(2)}h`;
}

const TimeTrackingPanel: React.FC<TimeTrackingPanelProps> = ({ jobId }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const retriesRef = useRef(0);

  const toast = {
    error: (msg: string) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3000);
    },
  };

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("time_entries")
      .select("id, job_id, user_id, start_time, end_time, users(full_name,email)")
      .eq("job_id", jobId)
      .order("start_time", { ascending: false });
    if (error) {
      console.error("Failed to fetch time entries", error);
      return;
    }
    setEntries(data as TimeEntry[]);
  };

  useEffect(() => {
    fetchEntries();
  }, [jobId]);

  useEffect(() => {
    const channel = supabase.channel(`time_entries_${jobId}`);
    const subscribe = () => {
      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "time_entries",
            filter: `job_id=eq.${jobId}`,
          },
          (payload) => {
            const row = payload.new as TimeEntry;
            setEntries((e) => [row, ...e]);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "time_entries",
            filter: `job_id=eq.${jobId}`,
          },
          (payload) => {
            const row = payload.new as TimeEntry;
            setEntries((e) => e.map((t) => (t.id === row.id ? row : t)));
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            retriesRef.current = 0;
          } else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            handleDisconnect();
          }
        });
    };

    const handleDisconnect = () => {
      supabase.removeChannel(channel);
      if (retriesRef.current < MAX_RETRIES) {
        retriesRef.current += 1;
        setTimeout(subscribe, 1000 * retriesRef.current);
      } else {
        toast.error("Realtime sync lost. Please refresh.");
      }
    };

    subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  const openEntry = entries.find((e) => !e.end_time && e.user_id === user?.id);

  const startTimer = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("time_entries")
      .insert({ job_id: jobId, user_id: user.id, start_time: new Date().toISOString(), end_time: null })
      .select("id, job_id, user_id, start_time, end_time, users(full_name,email)")
      .single();
    if (error) {
      console.error("Failed to start timer", error);
      toast.error("Failed to start timer");
    } else if (data) {
      setEntries((e) => [data as TimeEntry, ...e]);
    }
  };

  const stopTimer = async () => {
    if (!openEntry) return;
    const { data, error } = await supabase
      .from("time_entries")
      .update({ end_time: new Date().toISOString() })
      .eq("id", openEntry.id)
      .select("id, job_id, user_id, start_time, end_time, users(full_name,email)")
      .single();
    if (error) {
      console.error("Failed to stop timer", error);
      toast.error("Failed to stop timer");
    } else if (data) {
      setEntries((e) => e.map((t) => (t.id === data.id ? (data as TimeEntry) : t)));
    }
  };

  const updateEntry = async (id: string, start_time: string, end_time: string | null) => {
    const { data, error } = await supabase
      .from("time_entries")
      .update({ start_time, end_time })
      .eq("id", id)
      .select("id, job_id, user_id, start_time, end_time, users(full_name,email)")
      .single();
    if (error) {
      console.error("Failed to update entry", error);
      toast.error("Failed to update entry");
    } else if (data) {
      setEntries((e) => e.map((t) => (t.id === id ? (data as TimeEntry) : t)));
    }
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("time_entries").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete entry", error);
      toast.error("Failed to delete entry");
    } else {
      setEntries((e) => e.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="p-4 space-y-4">
      <SZButton onClick={openEntry ? stopTimer : startTimer}>
        {openEntry ? "Stop Timer" : "Start Timer"}
      </SZButton>
      <SZTable headers={["User", "Start", "End", "Duration", "Actions"]}>
        {entries.map((e) => {
          const editable = e.user_id === user?.id;
          const startLocal = e.start_time.slice(0, 16);
          const endLocal = e.end_time ? e.end_time.slice(0, 16) : "";
          return (
            <tr key={e.id} className="border-t">
              <td className="p-2 border">
                {e.users?.full_name || e.users?.email || e.user_id}
              </td>
              <td className="p-2 border">
                {editable ? (
                  <input
                    type="datetime-local"
                    value={startLocal}
                    onChange={(ev) => updateEntry(e.id, ev.target.value, e.end_time)}
                  />
                ) : (
                  formatLocal(e.start_time)
                )}
              </td>
              <td className="p-2 border">
                {editable ? (
                  <input
                    type="datetime-local"
                    value={endLocal}
                    onChange={(ev) => updateEntry(e.id, e.start_time, ev.target.value || null)}
                  />
                ) : e.end_time ? (
                  formatLocal(e.end_time)
                ) : (
                  "--"
                )}
              </td>
              <td className="p-2 border">{calcDuration(e.start_time, e.end_time)}</td>
              <td className="p-2 border">
                {editable && (
                  <SZButton size="sm" variant="secondary" onClick={() => deleteEntry(e.id)}>
                    Delete
                  </SZButton>
                )}
              </td>
            </tr>
          );
        })}
      </SZTable>
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded">
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default TimeTrackingPanel;
