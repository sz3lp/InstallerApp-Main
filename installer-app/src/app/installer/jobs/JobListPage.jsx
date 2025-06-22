import React from "react";
import { useNavigate } from "react-router-dom";
import useAssignedJobs from "../hooks/useAssignedJobs";
import { LoadingState, EmptyState, ErrorState } from "../../components/ui/state";

const statusStyles = {
  assigned: "bg-gray-400",
  in_progress: "bg-yellow-400",
  blocked: "bg-red-500",
  complete: "bg-green-500",
};

export default function JobListPage() {
  const navigate = useNavigate();
  const { jobs, loading, error } = useAssignedJobs();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Assigned Jobs</h1>

      {loading && <LoadingState type="list" />}
      {error && <ErrorState message={error} />}
      {!loading && !error && jobs.length === 0 && <EmptyState title="No Jobs" />}
      {!loading && !error && jobs.length > 0 && (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li
              key={job.id ?? job.jobNumber}
              className="bg-white rounded shadow p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/job/${job.id ?? job.jobNumber}`)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    {job.customerName ?? job.clientName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {job.id ?? job.jobNumber}
                  </p>
                </div>
                <span
                  className={`text-white text-sm px-2 py-1 rounded ${statusStyles[job.status] || "bg-gray-200"}`}
                >
                  {job.status?.replace("_", " ") ?? "Unknown"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
