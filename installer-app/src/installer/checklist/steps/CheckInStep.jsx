import React, { useState, useEffect } from "react";
import useJobChecklist from "../../../lib/hooks/useJobChecklist";

const CheckInStep = ({ jobId, onNext, onBack, step }) => {
  const { items, upsertEntry } = useJobChecklist(jobId);
  const existing = items.find((i) => i.step_name === "check_in");
  const initial = existing?.notes
    ? JSON.parse(existing.notes)
    : { present: "", reason: "" };
  const [present, setPresent] = useState(initial.present);
  const [reason, setReason] = useState(initial.reason);

  useEffect(() => {
    const notes = JSON.stringify({ present, reason });
    const completed =
      present === "yes" || (present === "no" && reason.trim() !== "");
    upsertEntry("check_in", { notes, completed });
  }, [present, reason, upsertEntry]);

  const canContinue =
    present === "yes" || (present === "no" && reason.trim() !== "");

  return (
    <div className="p-4 pb-20">
      <h2 className="text-xl font-semibold mb-4">Check-In</h2>
      <p className="mb-2">Customer home?</p>
      <div className="space-x-4 mb-4">
        <label className="inline-flex items-center">
          <input
            type="radio"
            value="yes"
            checked={present === "yes"}
            onChange={() => setPresent("yes")}
            className="mr-1"
          />
          Yes
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            value="no"
            checked={present === "no"}
            onChange={() => setPresent("no")}
            className="mr-1"
          />
          No
        </label>
      </div>
      {present === "no" && (
        <textarea
          className="border rounded w-full p-2"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason"
        />
      )}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between">
        <button onClick={onBack} disabled={!onBack} className="text-sm">
          Back
        </button>
        <span>Checklist Step {step} of 6</span>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="bg-green-600 text-white px-4 py-1 rounded disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default CheckInStep;
