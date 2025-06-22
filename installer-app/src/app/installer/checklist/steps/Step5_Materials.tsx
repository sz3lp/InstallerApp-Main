import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../../lib/supabaseClient";

interface Step5MaterialsProps {
  job: {
    id: string;
    materials: {
      id: string;
      label: string;
      quantity_used?: string | number;
      color_used?: string;
    }[];
  };
}

export default function Step5_Materials({ job }: Step5MaterialsProps) {
  const [entries, setEntries] = useState(() =>
    job.materials.map((m) => ({
      material_id: m.id,
      label: m.label,
      quantity_used: m.quantity_used || "",
      color_used: m.color_used || "",
    }))
  );

  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateField = (id: string, field: string, val: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.material_id === id ? { ...e, [field]: val } : e))
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const { error } = await supabase
      .from("job_checklists")
      .upsert(
        {
          job_id: job.id,
          materials: entries,
          step_5_completed_at: new Date().toISOString(),
        },
        { onConflict: "job_id" }
      );
    setSubmitting(false);
    if (!error) navigate(`/installer/job/${job.id}/checklist/6`);
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-2">Step 5 : Materials - Completed</h1>
      <p className="text-sm mb-4">
        Please provide the amount of materials used and color for each item below.
      </p>

      <div className="space-y-4 mb-6">
        {entries.map((entry) => (
          <div key={entry.material_id} className="border-b pb-4">
            <label className="block font-medium text-sm mb-1">{entry.label}</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Quantity Used"
              value={entry.quantity_used}
              onChange={(e) => updateField(entry.material_id, "quantity_used", e.target.value)}
            />
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Color Used"
              value={entry.color_used}
              onChange={(e) => updateField(entry.material_id, "color_used", e.target.value)}
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
