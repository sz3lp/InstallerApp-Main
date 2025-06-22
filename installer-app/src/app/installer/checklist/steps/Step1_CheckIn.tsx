import React from "react";

export default function Step1_CheckIn({ job }: { job: any }) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Step 1: Check In</h1>
      <p>Job ID: {job?.id}</p>
    </div>
  );
}
