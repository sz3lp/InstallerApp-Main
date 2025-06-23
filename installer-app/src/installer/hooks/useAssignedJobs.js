import { useState, useEffect } from "react";
import useInstallerAuth from "./useInstallerAuth";
import supabase from "../../lib/supabaseClient";

export default function useAssignedJobs() {
  const { installerId } = useInstallerAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchJobs() {
      if (!installerId) return;
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("jobs")
        .select("id, clinic_name, status")
        .eq("assigned_to", installerId)
        .order("created_at", { ascending: false });
      if (error) {
        setError(new Error("Failed to load jobs"));
        setJobs([]);
      } else {
        const mapped = (data || []).map((j) => ({
          id: j.id,
          clientName: j.clinic_name,
          status: j.status,
        }));
        setJobs(mapped);
      }
      setLoading(false);
    }
    fetchJobs();
  }, [installerId]);

  return { jobs, data: jobs, loading, error };
}
