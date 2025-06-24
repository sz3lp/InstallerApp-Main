import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import { SZModal } from "../../components/ui/SZModal";
import supabase from "../../lib/supabaseClient";
import { useAuth } from "../../lib/hooks/useAuth";
import { Toaster, toast } from "react-hot-toast";

interface TimeEntry {
  id: string;
  user_id: string;
  user_name: string | null;
  start_time: string;
  end_time: string | null;
}

const MAX_RETRIES = 5;

const TimeTrackingPanel: React.FC<{ jobId: string }> = ({ jobId }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [editing, setEditing] = useState<TimeEntry | null>(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");


  const loadEntries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("time_entries")
      .select(
        "id, user_id, start_time, end_time, users:users(full_name, email)"
      )
      .eq("job_id", jobId)
      .order("start_time", { ascending: false });
    if (error) {
      console.error(error);
      setEntries([]);
      toast.error("Failed to load entries");
    } else {
      const processed = (data ?? []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        user_name: row.users?.full_name ?? row.users?.email ?? row.user_id,
        start_time: row.start_time,
        end_time: row.end_time,
      }));
      setEntries(processed);
      const active = processed.find(
        (e) => e.user_id === user?.id && !e.end_time
      );
      setActiveEntry(active || null);
    }
    setLoading(false);
  }, [jobId, user?.id]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // realtime subscription
  useEffect(() => {
    let retries = 0;
    const subscribe = () => {
      const channel = supabase
        .channel(`time_entries_job_${jobId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "time_entries",
            filter: `job_id=eq.${jobId}`,
          },
          () => loadEntries()
        )
        .on("error", () => handleDisconnect(channel))
        .on("close", () => handleDisconnect(channel))
        .subscribe((status) => {
          if (status === "SUBSCRIBED") retries = 0;
        });
      return channel;
    };

    let channel = subscribe();
    const handleDisconnect = (ch: any) => {
      supabase.removeChannel(ch);
      if (retries < MAX_RETRIES) {
        retries += 1;
        setTimeout(() => {
          channel = subscribe();
        }, 1000 * retries);
      } else {
        toast.error("Realtime sync lost. Please refresh.");
      }
    };

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, loadEntries]);

  const startTimer = async () => {
    if (!user) return;
    const { error } = await supabase.from("time_entries").insert({
      user_id: user.id,
      job_id: jobId,
      start_time: new Date().toISOString(),
      end_time: null,
    });
    if (error) {
      toast.error("Failed to start timer");
    } else {
      toast.success("Timer started");
    }
  };

  const stopTimer = async () => {
    if (!user || !activeEntry) return;
    const { error } = await supabase
      .from("time_entries")
      .update({ end_time: new Date().toISOString() })
      .eq("id", activeEntry.id);
    if (error) {
      toast.error("Failed to stop timer");
    } else {
      toast.success("Timer stopped");
    }
  };

  const openEdit = (entry: TimeEntry) => {
    setEditing(entry);
    setEditStart(entry.start_time.slice(0, 16));
    setEditEnd(entry.end_time ? entry.end_time.slice(0, 16) : "");
  };

  const saveEdit = async () => {
    if (!editing) return;
    const { error } = await supabase
      .from("time_entries")
      .update({
        start_time: editStart,
        end_time: editEnd || null,
      })
      .eq("id", editing.id);
    if (error) {
      toast.error("Failed to update entry");
    } else {
      toast.success("Entry updated");
    }
    setEditing(null);
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("time_entries").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete entry");
    } else {
      toast.success("Entry deleted");
    }
  };

  const getDuration = useCallback((s: string, e: string | null) => {
    if (!e) return "";
    const ms = new Date(e).getTime() - new Date(s).getTime();
    return `${(ms / 3600000).toFixed(2)}h`;
  }, []);

  const rows = useMemo(() => entries, [entries]);

  return (
    <div className="p-4 space-y-4">
      <Toaster position="top-right" />
      <SZButton onClick={activeEntry ? stopTimer : startTimer}>
        {activeEntry ? "Stop Timer" : "Start Timer"}
      </SZButton>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <SZTable headers={["User", "Time", "Duration", "Actions"]}>
          {rows.map((e) => (
            <tr key={e.id} className="border-t">
              <td className="p-2 border">{e.user_name ?? e.user_id}</td>
              <td className="p-2 border">
                {new Date(e.start_time).toLocaleTimeString()} →{" "}
                {e.end_time
                  ? new Date(e.end_time).toLocaleTimeString()
                  : "-"}
              </td>
              <td className="p-2 border">
                {e.end_time ? getDuration(e.start_time, e.end_time) : ""}
              </td>
              <td className="p-2 border space-x-2">
                {e.user_id === user?.id && (
                  <>
                    <button
                      onClick={() => openEdit(e)}
                      className="text-blue-600 underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEntry(e.id)}
                      className="text-red-600 underline"
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </SZTable>
      )}
      <SZModal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Entry">
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium">Start</label>
            <input
              type="datetime-local"
              className="border rounded px-3 py-1 w-full"
              value={editStart}
              onChange={(e) => setEditStart(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">End</label>
            <input
              type="datetime-local"
              className="border rounded px-3 py-1 w-full"
              value={editEnd}
              onChange={(e) => setEditEnd(e.target.value)}
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <SZButton variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </SZButton>
            <SZButton onClick={saveEdit}>Save</SZButton>
          </div>
        </div>
      </SZModal>
    </div>
  );
};

export default TimeTrackingPanel;
