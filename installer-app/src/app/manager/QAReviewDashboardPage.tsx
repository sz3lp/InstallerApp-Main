import React, { useState } from "react";
import QAReviewJobList from "./QAReviewJobList";
import LoadingFallback from "../../components/ui/LoadingFallback";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBoundary from "../../components/ui/ErrorBoundary";
import StatusFilter from "../../components/filters/StatusFilter";
import InstallerSelector from "../../components/filters/InstallerSelector";
import useJobsForQA from "../../lib/hooks/useJobsForQA";

interface JobRow {
  id: string;
  clinic_name: string | null;
  completed_at: string | null;
}

const QAReviewDashboardPage: React.FC = () => {
  const [status, setStatus] = useState("needs_qa");
  const [installerId, setInstallerId] = useState("");
  const { jobs, loading, error } = useJobsForQA(status, installerId);

  return (
    <ErrorBoundary>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">QA Review Dashboard</h1>
        <div className="flex flex-wrap gap-2 items-end">
          <StatusFilter
            options={[
              { value: "needs_qa", label: "Needs QA" },
              { value: "rework", label: "Rework" },
            ]}
            value={status}
            onChange={setStatus}
          />
          <InstallerSelector value={installerId} onChange={setInstallerId} />
        </div>
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
