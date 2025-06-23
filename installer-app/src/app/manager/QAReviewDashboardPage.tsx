import React, { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import QAReviewJobList from "./QAReviewJobList";
import LoadingFallback from "../../components/ui/LoadingFallback";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBoundary from "../../components/ui/ErrorBoundary";

interface JobRow {
  id: string;
  clinic_name: string | null;
  completed_at: string | null;
}

const QAReviewDashboardPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, clinic_name, completed_at")
        .eq("status", "closed_pending_manager_approval")
        .order("completed_at", { ascending: false });
      if (error) {
        setError(error.message);
        setJobs([]);
      } else {
        setJobs(data ?? []);
        setError(null);
      }
      setLoading(false);
    };
    fetchJobs();
  }, []);

  return (
    <ErrorBoundary>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">QA Review Dashboard</h1>
        {loading ? (
          <LoadingFallback />
        ) : error ? (
          <EmptyState message="Failed to load jobs." />
        ) : jobs.length === 0 ? (
          <EmptyState message="No jobs currently awaiting QA review. Great work!" />
        ) : (
          <QAReviewJobList jobs={jobs} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default QAReviewDashboardPage;
