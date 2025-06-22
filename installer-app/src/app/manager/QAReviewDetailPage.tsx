import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../lib/supabaseClient";
import QAReviewJobDetailPanel from "./QAReviewJobDetailPanel";
import QAReviewActionsPanel from "./QAReviewActionsPanel";
import { SZCard } from "../../components/ui/SZCard";

interface Job {
  id: string;
  clinic_name: string | null;
  status: string;
}

const QAReviewDetailPage: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const fetchJob = async () => {
      const { data } = await supabase
        .from("jobs")
        .select("id, clinic_name, status")
        .eq("id", jobId)
        .single();
      setJob(data as Job);
    };
    fetchJob();
  }, [jobId]);

  if (!job) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">QA Review</h1>
      <SZCard>
        <p className="font-semibold">{job.clinic_name}</p>
        <p className="text-sm text-gray-500">Status: {job.status}</p>
      </SZCard>
      <QAReviewJobDetailPanel jobId={job.id} />
      <QAReviewActionsPanel
        jobId={job.id}
        onDone={() => navigate("/manager/qa")}
      />
    </div>
  );
};

export default QAReviewDetailPage;
