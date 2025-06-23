import React, { useEffect, useState, useCallback } from "react";
import supabase from "../../lib/supabaseClient";
import { GlobalLoading, GlobalError } from "../../components/global-states";

interface FeedbackRow {
  id: string;
  installer_name?: string | null;
  job_number?: string | null;
  date?: string | null;
  score?: number | null;
  issues?: string[] | null;
  notes?: string | null;
  created_at?: string;
}

const FeedbackReviewPanel: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from<FeedbackRow>("feedback")
      .select("id, installer_name, job_number, date, score, issues, notes, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
    }
    setFeedback(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  if (loading) return <GlobalLoading />;
  if (error) return <GlobalError message={error} onRetry={fetchFeedback} />;

  return (
    <div className="space-y-4">
      {feedback.map((f) => (
        <div key={f.id} className="p-2 rounded bg-gray-50">
          <div className="font-medium">
            {f.job_number} - {f.installer_name}
          </div>
          <div className="text-sm text-gray-600">Score: {f.score}</div>
          {f.issues && f.issues.length > 0 && (
            <div className="text-sm">Issues: {f.issues.join(", ")}</div>
          )}
          {f.notes && <div className="text-sm">Notes: {f.notes}</div>}
        </div>
      ))}
    </div>
  );
};

export default FeedbackReviewPanel;
