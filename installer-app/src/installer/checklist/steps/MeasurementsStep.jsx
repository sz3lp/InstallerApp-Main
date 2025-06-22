import React, { useState, useEffect } from "react";
import useJobChecklist from "../../../lib/hooks/useJobChecklist";

const fields = ["Width", "Height", "Depth"];

const MeasurementsStep = ({ jobId, onNext, onBack, step }) => {
  const { items, upsertEntry } = useJobChecklist(jobId);
  const existing = items.find((i) => i.step_name === "measurements");
  const initial = existing?.notes ? JSON.parse(existing.notes) : { values: {} };
  const [values, setValues] = useState(() => {
    const obj = {};
    fields.forEach((f) => {
      obj[f] = initial.values?.[f] || "";
    });
    return obj;
  });

  useEffect(() => {
    const payload = JSON.stringify({ values });
    upsertEntry("measurements", { notes: payload, completed: true });
  }, [values, upsertEntry]);

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="p-4 pb-20">
      <h2 className="text-xl font-semibold mb-4">Measurements</h2>
      {fields.map((f) => (
        <div key={f} className="mb-2">
          <label className="block text-sm font-semibold" htmlFor={f}>
            {f}
          </label>
          <input
            id={f}
            type="number"
            className="border rounded w-full p-2"
            value={values[f]}
            onChange={(e) => handleChange(f, e.target.value)}
          />
        </div>
      ))}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between">
        <button onClick={onBack} className="text-sm">
          Back
        </button>
        <span>Checklist Step {step} of 6</span>
        <button
          onClick={onNext}
          className="bg-green-600 text-white px-4 py-1 rounded"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default MeasurementsStep;
