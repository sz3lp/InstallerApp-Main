// src/pages/JobListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const statusStyles = {
  assigned: "bg-gray-400",
  in_progress: "bg-yellow-400",
  blocked: "bg-red-500",
  complete: "bg-green-500"
};

export default function JobListPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/jobs?assignedTo=user_345')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        setJobs(data);
      })
      .catch(() => {
        setError('Failed to load jobs');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Assigned Jobs</h1>
      {loading && <p>Loading jobs...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li
              key={job.id ?? job.jobNumber}
              className="bg-white rounded shadow p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/job/${job.id ?? job.jobNumber}`)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{job.customerName ?? job.clientName}</h2>
                  <p className="text-sm text-gray-600">{job.id ?? job.jobNumber}</p>
                </div>
                <span className={`text-white text-sm px-2 py-1 rounded ${statusStyles[job.status]}`}>{job.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
