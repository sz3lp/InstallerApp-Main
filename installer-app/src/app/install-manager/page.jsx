"use client";
import React, { useState } from "react";
import JobCard from "../../components/JobCard";
import { SZButton } from "../../components/ui/SZButton";
import supabase from "../../lib/supabaseClient";
import { useJobs } from "./useJobs";
import NewJobModal from "./NewJobModal";
import EditJobModal from "./EditJobModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function InstallManagerDashboard() {
  const { jobs, loading, error, refresh } = useJobs();
  const [newOpen, setNewOpen] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [deleteJob, setDeleteJob] = useState(null);

  const handleView = (id) => console.log("view", id);
  const handleEdit = (job) => setEditJob(job);
  const handleUpload = (id) => console.log("upload", id);
  const handleAssignInventory = (id) => console.log("assign inventory", id);

  return (
    <div className="p-4">
      <header className="sticky top-0 bg-white p-4 shadow mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">Install Manager Dashboard</h1>
        <SZButton size="sm" onClick={() => setNewOpen(true)}>
          New Job
        </SZButton>
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
                    onClick={() => handleEdit(job)}
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
                  <SZButton
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteJob(job)}
                  >
                    Delete
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
      <NewJobModal
        isOpen={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={refresh}
      />
      <EditJobModal
        job={editJob}
        isOpen={!!editJob}
        onClose={() => setEditJob(null)}
        onUpdated={refresh}
      />
      <ConfirmDeleteModal
        jobId={deleteJob?.id}
        isOpen={!!deleteJob}
        onClose={() => setDeleteJob(null)}
        onConfirm={async () => {
          if (deleteJob) {
            await supabase.from("jobs").delete().eq("id", deleteJob.id);
            setDeleteJob(null);
            refresh();
          }
        }}
      />
    </div>
  );
}
