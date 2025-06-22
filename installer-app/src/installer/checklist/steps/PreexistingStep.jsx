import React, { useState, useEffect } from "react";
import useJobChecklist from "../../../lib/hooks/useJobChecklist";

const options = ["Damage", "Wiring issues", "Other"];

const PreexistingStep = ({ jobId, onNext, onBack, step }) => {
  const { items, upsertEntry } = useJobChecklist(jobId);
  const existing = items.find((i) => i.step_name === "preexisting_conditions");
  const initial = existing?.notes
    ? JSON.parse(existing.notes)
    : { checks: [], notes: "" };
  const [checks, setChecks] = useState(initial.checks);
  const [notes, setNotes] = useState(initial.notes);

  useEffect(() => {
    const payload = JSON.stringify({ checks, notes });
    const completed = true;
    upsertEntry("preexisting_conditions", { notes: payload, completed });
  }, [checks, notes, upsertEntry]);

  const toggle = (idx) => {
    setChecks((prev) => {
      const set = new Set(prev);
      if (set.has(idx)) set.delete(idx);
      else set.add(idx);
      return Array.from(set);
    });
  };

  return (
    <div className="p-4 pb-20">
      <h2 className="text-xl font-semibold mb-4">Pre-existing Conditions</h2>
      <div className="space-y-2 mb-4">
        {options.map((opt, idx) => (
          <label key={idx} className="block">
            <input
              type="checkbox"
              className="mr-1"
              checked={checks.includes(idx)}
              onChange={() => toggle(idx)}
            />
            {opt}
          </label>
        ))}
      </div>
      <textarea
        className="border rounded w-full p-2"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Additional notes"
      />
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

export default PreexistingStep;
