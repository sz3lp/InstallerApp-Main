import React, { useState, useEffect } from "react";
import useJobChecklist from "../../../lib/hooks/useJobChecklist";

const InstallStep = ({ jobId, onNext, onBack, step }) => {
  const { items, upsertEntry } = useJobChecklist(jobId);
  const existing = items.find((i) => i.step_name === "install");
  const initial = existing?.notes
    ? JSON.parse(existing.notes)
    : { photo: null };
  const [file, setFile] = useState(null);

  useEffect(() => {
    const payload = JSON.stringify({ photo: file ? file.name : initial.photo });
    upsertEntry("install", { notes: payload, completed: !!file });
  }, [file, upsertEntry]);

  return (
    <div className="p-4 pb-20">
      <h2 className="text-xl font-semibold mb-4">Install Photos</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between">
        <button onClick={onBack} className="text-sm">
          Back
        </button>
        <span>Checklist Step {step} of 6</span>
        <button
          onClick={onNext}
          disabled={!file}
          className="bg-green-600 text-white px-4 py-1 rounded disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default InstallStep;
