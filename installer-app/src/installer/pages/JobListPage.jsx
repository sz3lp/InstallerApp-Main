// src/pages/JobListPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockJobs = [
  {
    jobNumber: "SEA#1041",
    clientName: "Lincoln Elementary",
    status: "assigned",
    dueDate: "2025-06-20",
    zones: [
      { label: "Zone 1 – Library", editable: false },
      { label: "", editable: true }
    ],
    installMode: "Conduit"
  },
  {
    jobNumber: "SEA#1042",
    clientName: "Jefferson High",
    status: "in_progress",
    dueDate: "2025-06-19",
    zones: [],
    installMode: "Standard"
  }
];

const statusStyles = {
  assigned: "bg-gray-400",
  in_progress: "bg-yellow-400",
  blocked: "bg-red-500",
  complete: "bg-green-500"
};

export default function JobListPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Assigned Jobs</h1>
      <ul className="space-y-4">
        {mockJobs.map((job) => (
          <li
            key={job.jobNumber}
            className="bg-white rounded shadow p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => navigate(`/job/${job.jobNumber}`)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{job.clientName}</h2>
                <p className="text-sm text-gray-600">{job.jobNumber}</p>
              </div>
              <span className={`text-white text-sm px-2 py-1 rounded ${statusStyles[job.status]}`}>
                {job.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-sm text-gray-500">Due: {job.dueDate}</p>
          </li>
        ))}
      </ul>
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
