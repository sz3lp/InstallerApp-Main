import { useEffect, useState } from "react";
import { useAuth } from "../../lib/hooks/useAuth";
import supabase from "../../lib/supabaseClient";
import { SZCard } from "../../components/ui/SZCard";
import { Link } from "react-router-dom";

interface JobRow {
  id: string;
  client_name: string | null;
  completed_at: string;
  status: string;
}

export default function JobHistoryPage() {
  const { session } = useAuth();
  const [jobs, setJobs] = useState<JobRow[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, client_id, completed_at, status, clients(name)")
        .eq("assigned_to", session?.user?.id)
        .in("status", ["needs_qa", "complete", "rework"])
        .order("completed_at", { ascending: false });
      if (!error) {
        const list = (data ?? []).map((j: any) => ({
          id: j.id,
          client_name: j.clients?.name ?? null,
          completed_at: j.completed_at,
          status: j.status,
        }));
        setJobs(list);
      }
    };
    if (session?.user?.id) fetch();
  }, [session]);

  const statusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "text-green-600";
      case "rework":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Completed Jobs</h1>
      <div className="grid gap-3">
        {jobs.map((job) => (
          <SZCard key={job.id} className="p-3 flex justify-between items-center">
            <div>
              <div className="font-semibold">{job.client_name}</div>
              <div className="text-sm text-gray-500">
                {new Date(job.completed_at).toLocaleDateString()}
              </div>
              <div className={`text-xs font-mono ${statusColor(job.status)}`}>{job.status}</div>
            </div>
            <Link to={`/installer/jobs/${job.id}`} className="text-blue-600 underline text-sm">
              View
            </Link>
          </SZCard>
        ))}
        {jobs.length === 0 && <p>No completed jobs found.</p>}
      </div>
    </div>
  );
}
