import React, { useEffect } from "react";
import { useJobs } from "../../lib/hooks/useJobs";
import { SZButton } from "../../components/ui/SZButton";

import JobAttachmentsPanel from "../../components/JobAttachmentsPanel";


export default function ManagerReview() {
  const { jobs, fetchJobs, updateStatus } = useJobs();

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const pending = jobs.filter((j) => j.status === "needs_qa");

  const handleDecision = async (id: string, verdict: "complete" | "rework") => {
    await updateStatus(id, verdict);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">QA Review</h1>
      {pending.length === 0 ? (
        <p>No jobs pending QA.</p>
      ) : (
        pending.map((job) => (

          <div key={job.id} className="border p-4 rounded shadow">
            <div className="font-semibold">Clinic: {job.clinic_name}</div>
            <div>Status: {job.status}</div>

          <div key={job.id} className="border p-4 rounded shadow">
            <div className="font-semibold">Clinic: {job.clinic_name}</div>
            <div>Status: {job.status}</div>

          <div key={job.id} className="border p-4 rounded shadow space-y-4">
            <div>
              <div className="font-semibold">Clinic: {job.clinic_name}</div>
              <div>Status: {job.status}</div>
            </div>
            <JobAttachmentsPanel jobId={job.id} />

            <div className="mt-2 flex gap-3">
              <SZButton onClick={() => handleDecision(job.id, "complete")}>Approve</SZButton>
              <SZButton
                variant="secondary"
                onClick={() => handleDecision(job.id, "rework")}
              >
                Needs Rework
              </SZButton>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
