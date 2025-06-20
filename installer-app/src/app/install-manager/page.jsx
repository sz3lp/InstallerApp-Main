"use client";
import React, { useEffect, useState } from "react";
import JobCard from "../../components/JobCard";
import { SZButton } from "../../components/ui/SZButton";
import supabase from "../../lib/supabaseClient";

export default function InstallManagerDashboard() {
  console.log("InstallManagerDashboard rendering");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("id, address, assigned_to, status, scheduled_date");
        if (error) throw error;
        const normalized = (data ?? []).map((j) => ({
          id: j.id,
          address: j.address,
          assignedTo: j.assigned_to,
          status: j.status,
          scheduledDate: j.scheduled_date,
        }));
        setJobs(normalized);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);
  const handleView = (id) => console.log("view", id);
  const handleEdit = (id) => console.log("edit", id);
  const handleUpload = (id) => console.log("upload", id);
  const handleAssignInventory = (id) => console.log("assign inventory", id);

  return (
    <div className="p-4">
      <header className="sticky top-0 bg-white p-4 shadow mb-4">
        <h1 className="text-2xl font-bold">Install Manager Dashboard</h1>
      </header>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="space-y-4">
        {jobs.map((job) => {
          try {
            return (
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
            );
          } catch (err) {
            console.error(err);
            return (
              <li key={job.id}>
                <div>Error loading job</div>
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
}
