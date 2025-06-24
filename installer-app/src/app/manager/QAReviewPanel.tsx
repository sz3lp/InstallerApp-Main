import React, { useEffect, useState } from "react";
import { SZTable } from "../../components/ui/SZTable";
import { SZButton } from "../../components/ui/SZButton";
import useAuth from "../../lib/hooks/useAuth";
import supabase from "../../lib/supabaseClient";

interface QAJob {
  id: string;
  clinic_name: string;
}

const QAReviewPanel: React.FC = () => {
  const { session } = useAuth();
  const reviewerId = session?.user?.id;
  const [jobs, setJobs] = useState<QAJob[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from<QAJob>("jobs")
      .select("id, clinic_name")
      .eq("status", "needs_qa");
    if (error) {
      setError(error.message);
      setJobs([]);
    } else {
      setError(null);
      setJobs(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDecision = async (
    jobId: string,
    decision: "approved" | "rework",
  ) => {
    if (!reviewerId) return;
    const note = notes[jobId] ?? "";

    await supabase.from("qa_reviews").insert({
      job_id: jobId,
      reviewer_id: reviewerId,
      decision,
      notes: note,
    });
    const { default: update } = await import("../../lib/updateUserOnboarding");
    await update(reviewerId, "manager_reviewed_job");

    if (decision === "approved") {
      const { error } = await supabase
        .from("jobs")
        .update({ status: "ready_for_invoice" })
        .eq("id", jobId);
      if (!error) {
        const { error: invErr } = await supabase.rpc(
          "generate_invoice_from_job",
          { p_job_id: jobId },
        );
        if (invErr) {
          await supabase
            .from("jobs")
            .update({ status: "needs_qa" })
            .eq("id", jobId);
          alert(`Failed to generate invoice: ${invErr.message}`);
        }
      }
    } else {
      await supabase.from("jobs").update({ status: "rework" }).eq("id", jobId);
    }

    fetchJobs();
    setNotes((n) => ({ ...n, [jobId]: "" }));
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <p>No jobs awaiting QA.</p>
      ) : (
        <SZTable headers={["Clinic", "Notes", "Actions"]}>
          {jobs.map((job) => (
            <tr key={job.id} className="border-t">
              <td className="p-2 border">{job.clinic_name}</td>
              <td className="p-2 border">
                <input
                  type="text"
                  value={notes[job.id] ?? ""}
                  onChange={(e) =>
                    setNotes((n) => ({ ...n, [job.id]: e.target.value }))
                  }
                  className="border rounded w-full p-1"
                />
              </td>
              <td className="p-2 border space-x-2">
                <SZButton
                  size="sm"
                  onClick={() => handleDecision(job.id, "approved")}
                >
                  Approve
                </SZButton>
                <SZButton
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDecision(job.id, "rework")}
                >
                  Rework
                </SZButton>
              </td>
            </tr>
          ))}
        </SZTable>
      )}
    </div>
  );
};

export default QAReviewPanel;
