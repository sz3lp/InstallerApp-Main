import { useState, useEffect } from "react";
import useInstallerAuth from "./useInstallerAuth";

export default function useAssignedJobs() {
  const { installerId } = useInstallerAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/jobs?assignedTo=${installerId}`);
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [installerId]);

  return { jobs, loading, error };
}
