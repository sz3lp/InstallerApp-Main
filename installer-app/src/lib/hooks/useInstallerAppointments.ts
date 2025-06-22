import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface Appointment {
  id: string;
  clinic_name: string;
  start_time: string;
  status: string;
}

export default function useInstallerAppointments(userId: string | null) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!userId) {
      setAppointments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("id, clinic_name, status, scheduled_date")
      .eq("assigned_to", userId)
      .order("scheduled_date", { ascending: true });
    if (error) {
      setError(error.message);
      setAppointments([]);
    } else {
      setError(null);
      setAppointments(
        (data ?? []).map((j: any) => ({
          id: j.id,
          clinic_name: j.clinic_name,
          start_time: j.scheduled_date,
          status: j.status,
        }))
      );
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return { appointments, loading, error, refresh: fetchAppointments } as const;
}
