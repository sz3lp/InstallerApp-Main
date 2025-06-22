import { useNavigate } from "react-router-dom";
import { useState } from "react";
import supabase from "../../../../lib/supabaseClient";

interface Step4InstallProps {
  job: { id: string };
}

export default function Step4_Install({ job }: Step4InstallProps) {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setSubmitting(true);
    const { error } = await supabase
      .from("job_checklists")
      .upsert(
        {
          job_id: job.id,
          install_photos_uploaded: true,
          step_4_completed_at: new Date().toISOString(),
        },
        { onConflict: "job_id" }
      );
    setSubmitting(false);
    if (!error) navigate(`/installer/job/${job.id}/checklist/5`);
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-2">Step 4 : Install - Completed</h1>
      <p className="text-sm mb-6">
        The installation photos have been uploaded successfully. Confirm below to proceed.
      </p>

      <div className="bg-green-100 text-green-800 text-sm rounded p-4 mb-6">
        ✅ Photos uploaded for this job.
      </div>

      <div className="fixed bottom-0 left-0 w-full px-4 py-3 bg-white border-t flex justify-between">
        <button
          className="text-sm bg-gray-200 px-4 py-2 rounded"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <button
          className="text-sm bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => navigate(`/installer/job/${job.id}/checklist`)}
        >
          Checklist
        </button>
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
