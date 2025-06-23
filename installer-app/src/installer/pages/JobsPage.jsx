import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import useInstallerAuth from "../hooks/useInstallerAuth";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "../../components/states";

const JobsPage = () => {
  const { installerId } = useInstallerAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!installerId) return;
    setLoading(true);
    fetch(`/api/jobs?assignedTo=${installerId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load jobs');
        return res.json();
      })
      .then((data) => {
        setJobs(data);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setJobs([]);
      })
      .finally(() => setLoading(false));
  }, [installerId]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header title="Jobs" />
      <main className="flex-grow p-4">
        <h1 className="text-2xl font-bold text-center mb-4">Select a Job</h1>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : jobs.length === 0 ? (
          <EmptyState message="No jobs found." />
        ) : (
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
        )}
      </main>
    </div>
  );
};

export default JobsPage;
