import React, { useState, useEffect } from "react";
import { useJobs } from "../../lib/hooks/useJobs";
import { SZInput } from "../../components/ui/SZInput";

export default function ArchivedJobsPage() {
  const { jobs, fetchJobs } = useJobs();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const archived = jobs
    .filter((j) => j.status === "archived")
    .filter((j) =>
      j.clinic_name?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Archived Jobs</h1>
      <SZInput
        id="search"
        label="Search by clinic"
        value={search}
        onChange={setSearch}
      />

      {archived.length === 0 ? (
        <p>No archived jobs found.</p>
      ) : (
        <div className="space-y-2">
          {archived.map((job) => (
            <div
              key={job.id}
              className="border rounded p-4 flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{job.clinic_name}</div>
                <div className="text-sm text-gray-500">
                  Job ID: {job.id.slice(0, 8)}... · Completed:{" "}
                  {new Date(job.updated_at).toLocaleDateString()}
                </div>
              </div>
              <a
                href={`/job/${job.id}`}
                className="text-blue-600 underline text-sm"
              >
                View Detail
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

