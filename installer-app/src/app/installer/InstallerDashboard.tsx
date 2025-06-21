import React from "react";
import { Link } from "react-router-dom";
import { useJobs } from "../../lib/hooks/useJobs";

const InstallerDashboard: React.FC = () => {
  const { jobs, loading } = useJobs();
  const myJobs = jobs.filter(
    (j) => j.status === "assigned" || j.status === "in_progress",
  );

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Assigned Jobs</h1>
      <ul className="space-y-2">
        {myJobs.map((j) => (
          <li key={j.id} className="p-2 border rounded">
            <Link
              to={`/installer/jobs/${j.id}`}
              className="text-blue-600 underline"
            >
              {j.clinic_name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InstallerDashboard;
