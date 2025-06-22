import React from "react";

export default function Step6_Satisfaction({ job }: { job: any }) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Step 6: Satisfaction</h1>
      <p>Job ID: {job?.id}</p>
    </div>
  );
}
