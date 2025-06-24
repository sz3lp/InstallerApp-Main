import React, { useEffect, useState } from "react";
import { SZButton } from "../../../components/ui/SZButton";
import { SZTable } from "../../../components/ui/SZTable";
import supabase from "../../../lib/supabaseClient";
import useAuth from "../../../lib/hooks/useAuth";

interface TimeLog {
  id: string;
  user_id: string;
  job_id: string | null;
  clock_in: string;
  clock_out: string | null;
  location: string | null;
  jobs?: { client: string | null; address: string | null } | null;
}

interface Props {
  jobId?: string | null;
}

function formatDuration(ms: number) {
  const hrs = Math.floor(ms / 3600000);
  const mins = Math.round((ms % 3600000) / 60000);
  return `${hrs}h ${mins}m`;
}

const InstallerTimeTrackingWidget: React.FC<Props> = ({ jobId }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [logs, setLogs] = useState<TimeLog[]>([]);

  useEffect(() => {
    if (!userId) return;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("time_logs")
        .select(
          "id, user_id, job_id, clock_in, clock_out, location, jobs(client,address)",
        )
        .eq("user_id", userId)
        .gte("clock_in", start.toISOString())
        .order("clock_in");
      if (!cancelled) setLogs((data as TimeLog[]) || []);
    };
    load();
    const channel = supabase.channel(`time_logs_${userId}`);
    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "time_logs",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as TimeLog;
          setLogs((cur) => {
            const exists = cur.some((l) => l.id === row.id);
            return exists
              ? cur.map((l) => (l.id === row.id ? row : l))
              : [...cur, row];
          });
        },
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const openLog = logs.find((l) => !l.clock_out && l.user_id === userId);

  const getLocation = () =>
    new Promise<string | null>((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(`${pos.coords.latitude},${pos.coords.longitude}`),
        () => resolve(null),
        { enableHighAccuracy: true },
      );
    });

  const startTimer = async () => {
    if (!userId) return;
    const loc = await getLocation();
    const { data, error } = await supabase
      .from("time_logs")
      .insert({
        user_id: userId,
        job_id: jobId ?? null,
        clock_in: new Date().toISOString(),
        location: loc,
        clock_out: null,
      })
      .select(
        "id, user_id, job_id, clock_in, clock_out, location, jobs(client,address)",
      )
      .single();
    if (!error && data) setLogs((cur) => [...cur, data as TimeLog]);
  };

  const stopTimer = async () => {
    if (!openLog) return;
    const { data, error } = await supabase
      .from("time_logs")
      .update({ clock_out: new Date().toISOString() })
      .eq("id", openLog.id)
      .select(
        "id, user_id, job_id, clock_in, clock_out, location, jobs(client,address)",
      )
      .single();
    if (!error && data)
      setLogs((cur) =>
        cur.map((l) => (l.id === data.id ? (data as TimeLog) : l)),
      );
  };

  const totalMs = logs.reduce((sum, l) => {
    const start = new Date(l.clock_in).getTime();
    const end = new Date(l.clock_out ?? new Date()).getTime();
    return sum + Math.max(end - start, 0);
  }, 0);

  const exportCSV = () => {
    let csv = "Job,Clock In,Clock Out,Duration,Location\n";
    logs.forEach((l) => {
      const job = l.jobs?.client || l.jobs?.address || l.job_id || "";
      const dur =
        new Date(l.clock_out ?? new Date()).getTime() -
        new Date(l.clock_in).getTime();
      csv += `"${job}","${new Date(l.clock_in).toLocaleTimeString()}","${l.clock_out ? new Date(l.clock_out).toLocaleTimeString() : ""}","${formatDuration(dur)}","${l.location ?? ""}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "time_logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SZButton onClick={openLog ? stopTimer : startTimer}>
          {openLog ? "Stop Timer" : "Start Timer"}
        </SZButton>
        <span className="font-semibold">Today: {formatDuration(totalMs)}</span>
        {openLog && <span className="text-green-600">● Running</span>}
        <SZButton size="sm" variant="secondary" onClick={exportCSV}>
          Export
        </SZButton>
      </div>
      <SZTable headers={["Job", "Clock In", "Clock Out", "Duration"]}>
        {logs.map((l) => {
          const dur =
            new Date(l.clock_out ?? new Date()).getTime() -
            new Date(l.clock_in).getTime();
          return (
            <tr key={l.id} className="border-t">
              <td className="p-2 border">
                {l.jobs?.client || l.jobs?.address || l.job_id}
              </td>
              <td className="p-2 border">
                {new Date(l.clock_in).toLocaleTimeString()}
              </td>
              <td className="p-2 border">
                {l.clock_out
                  ? new Date(l.clock_out).toLocaleTimeString()
                  : "--"}
              </td>
              <td className="p-2 border">{formatDuration(dur)}</td>
            </tr>
          );
        })}
      </SZTable>
    </div>
  );
};

export default InstallerTimeTrackingWidget;
