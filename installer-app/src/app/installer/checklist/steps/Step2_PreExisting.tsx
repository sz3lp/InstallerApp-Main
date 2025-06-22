import React from "react";

export default function Step2_PreExisting({ job }: { job: any }) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Step 2: Pre-Existing Conditions</h1>
      <p>Job ID: {job?.id}</p>
    </div>
  );
}
