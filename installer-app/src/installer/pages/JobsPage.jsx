import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import useInstallerAuth from "../hooks/useInstallerAuth";

const JobsPage = () => {
  const { installerId } = useInstallerAuth();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (!installerId) return;
    fetch(`/api/jobs?assignedTo=${installerId}`)
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch(() => setJobs([]));
  }, [installerId]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header title="Jobs" />
      <main className="flex-grow p-4">
        <h1 className="text-2xl font-bold text-center mb-4">Select a Job</h1>
        <ul className="space-y-2 max-w-sm mx-auto">
          {jobs.map((job) => (
            <li key={job.jobId}>
              <Link
                to={`/job/${job.jobId}`}
                className="block bg-white rounded shadow px-4 py-2 text-green-600 hover:bg-gray-50 text-center"
              >
                {job.jobId}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default JobsPage;
