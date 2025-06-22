import React from "react";

export default function Step5_Materials({ job }: { job: any }) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Step 5: Materials</h1>
      <p>Job ID: {job?.id}</p>
    </div>
  );
}
