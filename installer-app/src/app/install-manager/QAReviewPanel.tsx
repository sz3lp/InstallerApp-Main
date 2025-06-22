import React, { useEffect, useState, useCallback } from "react";
import JobCard from "../../components/JobCard";
import { SZButton } from "../../components/ui/SZButton";
import supabase from "../../lib/supabaseClient";
import DocumentViewerModal from "../../installer/components/DocumentViewerModal";

export type QAReviewPanelProps = {};

interface QAJobRow {
  id: string;
  address: string;
  assigned_to: string | null;
  status: string;
  scheduled_date: string;
  documents: any[] | null;
}

interface QAJob {
  id: string;
  address: string;
  assignedTo: string | null;
  status: string;
  scheduledDate: string;
  documents: any[];
}

const QAReviewPanel: React.FC<QAReviewPanelProps> = () => {
  const [jobs, setJobs] = useState<QAJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDocs, setActiveDocs] = useState<any[] | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from<QAJobRow>("jobs")
      .select(
        "id, address, assigned_to, status, scheduled_date, documents(id, name, url, path, type)",
      )
      .eq("status", "needs_qa");
    if (error) {
      setError(error.message);
    }
    setJobs(
      (data ?? []).map((j) => ({
        id: j.id,
        address: j.address,
        assignedTo: j.assigned_to,
        status: j.status,
        scheduledDate: j.scheduled_date,
        documents: j.documents ?? [],
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const updateStatus = async (id: string, status: "complete" | "rework") => {
    await supabase.from("jobs").update({ status }).eq("id", id);
    fetchJobs();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div key={job.id} className="p-2 rounded bg-gray-50">
          <JobCard job={job} />
          {job.documents.length > 0 && (
            <div className="mt-2">
              <SZButton
                size="sm"
                variant="secondary"
                onClick={() => setActiveDocs(job.documents)}
              >
                View Docs
              </SZButton>
            </div>
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
              variant="secondary"
              onClick={() => updateStatus(job.id, "rework")}
            >
              Request Rework
            </SZButton>
          </div>
        </div>
      ))}
      <DocumentViewerModal
        isOpen={!!activeDocs}
        onClose={() => setActiveDocs(null)}
        documents={activeDocs ?? []}
      />
    </div>
  );
};

export default QAReviewPanel;
