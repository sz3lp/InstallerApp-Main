import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../../lib/supabaseClient";

export default function Step3_Measurements({ job }) {
  const [entries, setEntries] = useState(() =>
    job.items.map((item: any) => ({
      item_id: item.id,
      label: item.label,
      length_ft: item.measurement_ft || "",
    }))
  );

  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateLength = (id: string, val: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.item_id === id ? { ...e, length_ft: val } : e))
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const { error } = await supabase
      .from("job_checklists")
      .upsert(
        {
          job_id: job.id,
          measurements: entries,
          step_3_completed_at: new Date().toISOString(),
        },
        { onConflict: "job_id" }
      );
    setSubmitting(false);
    if (!error) navigate(`/installer/job/${job.id}/checklist/4`);
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-2">Step 3 : Measurements - Completed</h1>
      <p className="text-sm mb-4">
        Please provide the measurements of the installed items below. Enter in feet.
      </p>

      <div className="space-y-4 mb-6">
        {entries.map((entry) => (
          <div key={entry.item_id}>
            <label className="block text-sm font-medium mb-1">{entry.label}</label>
            <input
              type="number"
              value={entry.length_ft}
              onChange={(e) => updateLength(entry.item_id, e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Length (ft)"
            />
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full px-4 py-3 bg-white border-t flex justify-between">
        <button className="text-sm bg-gray-200 px-4 py-2 rounded" onClick={() => navigate(-1)}>
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
