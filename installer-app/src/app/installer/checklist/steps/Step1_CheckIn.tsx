import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../../lib/supabaseClient";

export default function Step1_CheckIn({ job }: { job: { id: string } }) {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (isHome: boolean) => {
    setSubmitting(true);
    const { error } = await supabase
      .from("job_checklists")
      .upsert(
        {
          job_id: job.id,
          customer_home: isHome,
          step_1_completed_at: new Date().toISOString(),
        },
        { onConflict: "job_id" }
      );
    setSubmitting(false);
    if (!error) navigate(`/installer/job/${job.id}/checklist/2`);
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-2">Step 1 : Check In - Completed</h1>
      <p className="text-sm mb-6">
        Please answer the question listed below. If the customer is not home, please notify your Installation Manager accordingly.
      </p>

      <div className="mb-6">
        <p className="text-base font-medium mb-4">Is the customer home?</p>
        <div className="flex gap-4">
          <button
            className="flex-1 bg-green-500 text-white py-2 rounded"
            onClick={() => handleSubmit(true)}
            disabled={submitting}
          >
            Yes
          </button>
          <button
            className="flex-1 bg-gray-300 text-black py-2 rounded"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
          >
            No
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full px-4 py-3 bg-white border-t flex justify-between">
        <button className="text-sm bg-gray-200 px-4 py-2 rounded" onClick={() => navigate(-1)}>Back</button>
        <button className="text-sm bg-green-600 text-white px-4 py-2 rounded" onClick={() => navigate(`/installer/job/${job.id}/checklist`)}>Checklist</button>
        <button className="text-sm bg-green-600 text-white px-4 py-2 rounded" onClick={() => navigate(`/installer/job/${job.id}/checklist/2`)}>Continue</button>
      </div>
    </div>
  );
}
