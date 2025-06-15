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

// src/pages/JobDetailPage.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const mockJob = {
  jobNumber: "SEA#1041",
  clientName: "Lincoln Elementary",
  status: "assigned",
  dueDate: "2025-06-20",
  zones: [
    { label: "Zone 1 – Library", editable: false },
    { label: "", editable: true }
  ],
  installMode: "Conduit"
};

export function JobDetailPage() {
  const { jobId } = useParams();
  const [zones, setZones] = useState(mockJob.zones);

  const handleZoneLabelChange = (index, newLabel) => {
    const updated = [...zones];
    updated[index].label = newLabel;
    updated[index].editable = false;
    setZones(updated);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{mockJob.clientName}</h1>
      <p className="text-sm text-gray-600 mb-2">{mockJob.jobNumber}</p>
      <p className="text-sm text-gray-500 mb-2">Due: {mockJob.dueDate}</p>
      <p className="text-sm font-semibold">Install Mode: <span className="text-gray-700">{mockJob.installMode}</span></p>

      <h2 className="mt-6 mb-2 text-lg font-semibold">Zones</h2>
      <ul className="space-y-2">
        {zones.map((zone, index) => (
          <li key={index} className="bg-white p-3 rounded shadow">
            {zone.editable ? (
              <input
                type="text"
                className="border px-2 py-1 w-full"
                placeholder="Enter zone label"
                value={zone.label}
                onChange={(e) => handleZoneLabelChange(index, e.target.value)}
              />
            ) : (
              <p className="text-gray-800">{zone.label}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
