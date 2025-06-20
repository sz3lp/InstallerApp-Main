import React from "react";
import JobCard, { Job } from "../../components/JobCard";
import { SZButton } from "../../components/ui/SZButton";

const mockJobs: Job[] = [
  {
    id: "JOB001",
    address: "123 Main St",
    assignedTo: "Alice Johnson",
    status: "assigned",
    scheduledDate: "2025-06-21",
  },
  {
    id: "JOB002",
    address: "456 Oak Ave",
    assignedTo: null,
    status: "in_progress",
    scheduledDate: "2025-06-22",
  },
  {
    id: "JOB003",
    address: "789 Pine Rd",
    assignedTo: "Bob Smith",
    status: "needs_qa",
    scheduledDate: "2025-06-23",
  },
];

export default function InstallManagerDashboard() {
  const handleView = (id: string) => console.log("view", id);
  const handleEdit = (id: string) => console.log("edit", id);
  const handleUpload = (id: string) => console.log("upload", id);
  const handleAssignInventory = (id: string) =>
    console.log("assign inventory", id);

  return (
    <div className="p-4">
      <header className="sticky top-0 bg-white p-4 shadow mb-4">
        <h1 className="text-2xl font-bold">Install Manager Dashboard</h1>
      </header>
      <ul className="space-y-4">
        {mockJobs.map((job) => (
          <li key={job.id} className="p-2 rounded bg-gray-50">
            <JobCard job={job} onViewDetails={() => handleView(job.id)} />
            <div className="mt-2 flex gap-2">
              <SZButton size="sm" onClick={() => handleView(job.id)}>
                View
              </SZButton>
              <SZButton
                size="sm"
                variant="secondary"
                onClick={() => handleEdit(job.id)}
              >
                Edit
              </SZButton>
              <SZButton
                size="sm"
                variant="secondary"
                onClick={() => handleUpload(job.id)}
              >
                Upload Docs
              </SZButton>
              <SZButton
                size="sm"
                variant="secondary"
                onClick={() => handleAssignInventory(job.id)}
              >
                Assign Inventory
              </SZButton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
