import React, { useState } from "react";
import { SZTextarea } from "../../components/ui/SZTextarea";
import { SZButton } from "../../components/ui/SZButton";
import { SZCard } from "../../components/ui/SZCard";
import supabase from "../../lib/supabaseClient";
import { useAuth } from "../../lib/hooks/useAuth";

interface Props {
  jobId: string;
  onDone: () => void;
}

const QAReviewActionsPanel: React.FC<Props> = ({ jobId, onDone }) => {
  const { session } = useAuth();
  const [comments, setComments] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAction = async (action: "approve" | "reject" | "hold") => {
    if (!session?.user) return;
    setSaving(true);
    const reviewer = session.user.id;
    await supabase.from("job_qa_reviews").insert({
      job_id: jobId,
      reviewer_user_id: reviewer,
      review_action: action,
      review_comments: comments,
    });
    const now = new Date().toISOString();
    if (action === "approve") {
      await supabase
        .from("jobs")
        .update({
          status: "approved_ready_for_invoice_payroll",
          qa_approved_by_user_id: reviewer,
          qa_approved_at: now,
        })
        .eq("id", jobId);
    } else if (action === "reject") {
      await supabase
        .from("jobs")
        .update({
          status: "rejected_sent_back_for_revisions",
          qa_rejected_by_user_id: reviewer,
          qa_rejected_at: now,
        })
        .eq("id", jobId);
    } else {
      await supabase
        .from("jobs")
        .update({ status: "on_hold_qa_review" })
        .eq("id", jobId);
    }
    setSaving(false);
    onDone();
  };

  return (
    <SZCard>
      <h2 className="font-semibold mb-2">QA Actions</h2>
      <SZTextarea
        id="qa-comments"
        label="Review Comments"
        value={comments}
        onChange={setComments}
      />
      <div className="mt-2 flex gap-2">
        <SZButton isLoading={saving} onClick={() => handleAction("approve")}>
          Approve
        </SZButton>
        <SZButton
          variant="secondary"
          isLoading={saving}
          disabled={!comments.trim()}
          onClick={() => handleAction("reject")}
        >
          Send Back
        </SZButton>
        <SZButton
          variant="secondary"
          isLoading={saving}
          onClick={() => handleAction("hold")}
        >
          Hold
        </SZButton>
      </div>
    </SZCard>
  );
};

export default QAReviewActionsPanel;
