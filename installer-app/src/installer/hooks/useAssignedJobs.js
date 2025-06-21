import { useState, useEffect } from "react";
import { useAuth } from "../../lib/hooks/useAuth";
import supabase from "../../lib/supabaseClient";

export default function useAssignedJobs() {
  const { session } = useAuth();
  const installerId = session?.user?.id;
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!installerId) {
      setJobs([]);
      setLoading(false);
      return;
    }

    async function fetchJobs() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("jobs")
        .select(
          "id, address, assigned_to, status, scheduled_date, clinic_name, documents"
        )
        .eq("assigned_to", installerId)
        .order("scheduled_date", { ascending: true });

      if (error) {
        setError(error.message);
        setJobs([]);
      } else {
        setJobs(
          (data ?? []).map((j) => ({
            id: j.id,
            address: j.address,
            assignedTo: j.assigned_to,
            status: j.status,
            scheduledDate: j.scheduled_date,
            clientName: j.clinic_name,
            documents: j.documents ?? [],
          }))
        );
      }
      setLoading(false);
    }

    fetchJobs();
  }, [installerId]);

  return { jobs, loading, error };
}
