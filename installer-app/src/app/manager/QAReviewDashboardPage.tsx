import React, { useState } from "react";
import QAReviewJobList from "./QAReviewJobList";
import LoadingFallback from "../../components/ui/LoadingFallback";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBoundary from "../../components/ui/ErrorBoundary";
import { useJobsForQA } from "../../lib/hooks/useJobsForQA";
import StatusFilter from "../../components/filters/StatusFilter";
import InstallerSelector from "../../components/filters/InstallerSelector";

const QAReviewDashboardPage: React.FC = () => {
  const [status, setStatus] = useState<string>("closed_pending_manager_approval");
  const [installer, setInstaller] = useState<string>("");
  const { jobs, loading, error } = useJobsForQA({ status, installerId: installer });

  return (
    <ErrorBoundary>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">QA Review Dashboard</h1>
        <div className="flex gap-4">
          <StatusFilter
            options={[
              { value: "closed_pending_manager_approval", label: "Pending" },
              { value: "needs_qa", label: "Needs QA" },
              { value: "rework", label: "Rework" },
            ]}
            value={status}
            onChange={setStatus}
          />
          <InstallerSelector value={installer} onChange={setInstaller} />
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
