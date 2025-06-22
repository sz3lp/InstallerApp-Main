import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../../lib/supabaseClient";

export default function Step2_PreExisting({ job }: { job: { id: string } }) {
  const [hasCondition, setHasCondition] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setSubmitting(true);
    const { error } = await supabase
      .from("job_checklists")
      .upsert(
        {
          job_id: job.id,
          pre_existing: hasCondition,
          step_2_completed_at: new Date().toISOString(),
        },
        { onConflict: "job_id" }
      );
    setSubmitting(false);
    if (!error) navigate(`/installer/job/${job.id}/checklist/3`);
  };

  return (
    <div className="p-4 pb-24">
      <h1 className="text-lg font-semibold mb-2">Step 2 : Pre-existing Conditions - Completed</h1>
      <p className="text-sm mb-4">
        Please take a few moments to review the existing conditions of the work site. LeafFilter is not responsible for any existing condition of the gutter or the home, nor does it take any liability regarding the nature of response from our product to these conditions.
      </p>

      <label className="flex items-center space-x-2 mb-6">
        <input
          type="checkbox"
          checked={hasCondition}
          onChange={(e) => setHasCondition(e.target.checked)}
          className="w-4 h-4"
        />
        <span>This home has pre-existing conditions.</span>
      </label>

      <div className="fixed bottom-0 left-0 w-full px-4 py-3 bg-white border-t flex justify-between">
        <button className="text-sm bg-gray-200 px-4 py-2 rounded" onClick={() => navigate(-1)}>Back</button>
        <button className="text-sm bg-green-600 text-white px-4 py-2 rounded" onClick={() => navigate(`/installer/job/${job.id}/checklist`)}>Checklist</button>
        <button
          className="text-sm bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
          disabled={submitting}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
