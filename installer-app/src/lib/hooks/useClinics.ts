import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface Client {
  id: string;
  name: string;
  contact_name: string;
  contact_email: string;
  address: string;
}

export function useClinics() {
  const [clinics, setClinics] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClinics = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from<Client>("clinics")
      .select("id, name, contact_name, contact_email, address")
      .order("name", { ascending: true });
    if (error) {
      setError(error.message);
      setClinics([]);
    } else {
      setClinics(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  const createClinic = useCallback(async (clinic: Omit<Client, "id">) => {
    const { data, error } = await supabase
      .from<Client>("clinics")
      .insert(clinic)
      .select()
      .single();
    if (error) throw error;
    setClinics((cs) => [...cs, data]);
    return data;
  }, []);

  const updateClinic = useCallback(async (id: string, clinic: Omit<Client, "id">) => {
    const { data, error } = await supabase
      .from<Client>("clinics")
      .update(clinic)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setClinics((cs) => cs.map((c) => (c.id === id ? data : c)));
    return data;
  }, []);

  const deleteClinic = useCallback(async (id: string) => {
    const { error } = await supabase.from("clinics").delete().eq("id", id);
    if (error) throw error;
    setClinics((cs) => cs.filter((c) => c.id !== id));
  }, []);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  return [
    clinics,
    {
      loading,
      error,
      createClinic,
      updateClinic,
      deleteClinic,
    },
  ] as const;
}

export default useClinics;
