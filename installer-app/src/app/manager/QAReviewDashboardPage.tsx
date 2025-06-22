import React, { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import QAReviewJobList from "./QAReviewJobList";

interface JobRow {
  id: string;
  clinic_name: string | null;
  completed_at: string | null;
}

const QAReviewDashboardPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from("jobs")
        .select("id, clinic_name, completed_at")
        .eq("status", "closed_pending_manager_approval")
        .order("completed_at", { ascending: false });
      setJobs(data ?? []);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">QA Review Dashboard</h1>
      {loading ? <p>Loading...</p> : <QAReviewJobList jobs={jobs} />}
    </div>
  );
};

export default QAReviewDashboardPage;
