import React from "react";
import { Link, useParams } from "react-router-dom";
import { useChecklistLogic } from "../../../hooks/useChecklistLogic";
import { useJob } from "../../../hooks/useJob";
import { LoadingState } from "../../../components/ui/state/LoadingState";
import { ErrorState } from "../../../components/ui/state/ErrorState";

export default function ChecklistIndexPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { job, loading, error } = useJob(jobId || null);
  const steps = useChecklistLogic(job);

  if (loading) return <LoadingState />;
  if (error || !job) return <ErrorState message="Job not found" />;

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-xl font-bold mb-4">Checklist</h1>
      <ul className="space-y-2">
        {steps.map((s) => (
          <li key={s.step}>
            <Link
              to={`/installer/job/${jobId}/checklist/${s.step}`}
              className="text-green-700 underline"
            >
              Step {s.step}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
