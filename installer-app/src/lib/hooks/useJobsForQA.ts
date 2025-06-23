import { useState, useEffect, useCallback } from 'react';
import supabase from '../supabaseClient';

export interface QAJob {
  id: string;
  clinic_name: string | null;
  completed_at: string | null;
}

export default function useJobsForQA(status?: string, installerId?: string) {
  const [jobs, setJobs] = useState<QAJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('jobs')
      .select('id, clinic_name, completed_at')
      .order('completed_at', { ascending: false });
    if (status) query = query.eq('status', status);
    if (installerId) query = query.eq('assigned_to', installerId);
    const { data, error } = await query;
    if (error) {
      setError(error.message);
      setJobs([]);
    } else {
      setJobs(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [status, installerId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, fetchJobs } as const;
}
