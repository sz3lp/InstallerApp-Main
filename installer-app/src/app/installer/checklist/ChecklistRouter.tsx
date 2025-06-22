import { useParams, useNavigate } from "react-router-dom";
import { useChecklistLogic } from "../../../hooks/useChecklistLogic";
import { useJob } from "../../../hooks/useJob";
import { LoadingState } from "../../../components/ui/state/LoadingState";
import { ErrorState } from "../../../components/ui/state/ErrorState";

export default function ChecklistRouter() {
  const { jobId, stepId } = useParams();
  const navigate = useNavigate();
  const { job, loading, error } = useJob(jobId || null);
  const steps = useChecklistLogic(job);

  if (loading) return <LoadingState />;
  if (error || !job) return <ErrorState message="Job not found." />;

  const step = steps.find((s) => s.step === Number(stepId));
  if (!step) {
    return (
      <div className="p-4">
        <h1 className="text-lg font-bold mb-2">Invalid Step</h1>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => navigate(`/installer/job/${jobId}/checklist`)}
        >
          Return to Checklist
        </button>
      </div>
    );
  }

  return step.component;
}
