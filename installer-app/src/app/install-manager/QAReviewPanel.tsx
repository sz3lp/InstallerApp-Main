import React, { useCallback, useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import JobCard, { Job } from "../../components/JobCard";
import { SZButton } from "../../components/ui/SZButton";
import DocumentViewerModal from "../../installer/components/DocumentViewerModal.jsx";

interface QAJob extends Job {
  documents?: { id: string; name: string; type: string; url: string }[];
}

const QAReviewPanel: React.FC = () => {
  const [jobs, setJobs] = useState<QAJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewDocs, setViewDocs] = useState<QAJob | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("jobs")
      .select("id, address, assigned_to, status, scheduled_date, documents")
      .eq("status", "needs_qa");

    if (error) {
      setError(error.message);
    }

    setJobs(
      (data ?? []).map((j: any) => ({
        id: j.id,
        address: j.address,
        assignedTo: j.assigned_to,
        status: j.status,
        scheduledDate: j.scheduled_date,
        documents: j.documents || [],
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const updateStatus = async (jobId: string, status: string) => {
    await supabase.from("jobs").update({ status }).eq("id", jobId);
    fetchJobs();
  };

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-4">QA Review</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="space-y-4">
        {jobs.map((job) => (
          <li key={job.id} className="p-2 rounded bg-gray-50">
            <JobCard job={job} />
            {job.documents && job.documents.length > 0 ? (
              <div className="mt-2">
                <SZButton
                  size="sm"
                  variant="secondary"
                  onClick={() => setViewDocs(job)}
                >
                  View Docs
                </SZButton>
              </div>
            ) : (
              <p className="text-sm mt-2">No documents uploaded</p>
            )}
            <div className="mt-2 flex gap-2">
              <SZButton
                size="sm"
                onClick={() => updateStatus(job.id, "complete")}
              >
                Approve
              </SZButton>
              <SZButton
                size="sm"
                variant="destructive"
                onClick={() => updateStatus(job.id, "rework")}
              >
                Request Rework
              </SZButton>
            </div>
          </li>
        ))}
      </ul>
      <DocumentViewerModal
        isOpen={!!viewDocs}
        onClose={() => setViewDocs(null)}
        documents={viewDocs?.documents ?? []}
      />
    </section>
  );
};

export default QAReviewPanel;
