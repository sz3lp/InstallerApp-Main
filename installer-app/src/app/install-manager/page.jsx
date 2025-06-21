import React, { useState } from "react";
import JobCard from "../../components/JobCard";
import { SZButton } from "../../components/ui/SZButton";
import supabase from "../../lib/supabaseClient";
import { useJobs } from "./useJobs";
import EditJobModal from "./EditJobModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import QAReviewPanel from "./QAReviewPanel";
import { useNavigate } from "react-router-dom";
import UploadDocsModal from "./UploadDocsModal";
import AssignInventoryModal from "./AssignInventoryModal";

export default function InstallManagerDashboard() {
  const { jobs, loading, error, refresh } = useJobs();
  const navigate = useNavigate();
  const [editJob, setEditJob] = useState(null);
  const [deleteJob, setDeleteJob] = useState(null);
  const [uploadJobId, setUploadJobId] = useState(null);
  const [inventoryJobId, setInventoryJobId] = useState(null);

  const handleView = (id) => navigate(`/install-manager/job/${id}`);
  const handleEdit = (job) => setEditJob(job);
  const handleUpload = (id) => setUploadJobId(id);
  const handleAssignInventory = (id) => setInventoryJobId(id);

  return (
    <div className="p-4">
      <header className="sticky top-0 bg-white p-4 shadow mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">Install Manager Dashboard</h1>
        <SZButton size="sm" onClick={() => navigate('/install-manager/job/new')}>
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
      <UploadDocsModal
        jobId={uploadJobId}
        isOpen={!!uploadJobId}
        onClose={() => setUploadJobId(null)}
        onUploaded={refresh}
      />
      <AssignInventoryModal
        jobId={inventoryJobId}
        isOpen={!!inventoryJobId}
        onClose={() => setInventoryJobId(null)}
      />
      <h2 className="text-xl font-bold mt-8 mb-4">QA Review</h2>
      <QAReviewPanel />
    </div>
  );
}
