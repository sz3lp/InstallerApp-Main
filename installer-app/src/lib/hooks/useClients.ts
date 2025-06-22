import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface Client {
  id: string;
  name: string;
  contact_name: string;
  contact_email: string;
  address: string;
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from<Client>("clients")
      .select("id, name, contact_name, contact_email, address")
      .order("name", { ascending: true });
    if (error) {
      setError(error.message);
      setClients([]);
    } else {
      setClients(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  const createClient = useCallback(async (client: Omit<Client, "id">) => {
    const { data, error } = await supabase
      .from<Client>("clients")
      .insert(client)
      .select()
      .single();
    if (error) throw error;
    setClients((cs) => [...cs, data]);
    return data;
  }, []);

  const updateClient = useCallback(async (id: string, client: Omit<Client, "id">) => {
    const { data, error } = await supabase
      .from<Client>("clients")
      .update(client)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setClients((cs) => cs.map((c) => (c.id === id ? data : c)));
    return data;
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) throw error;
    setClients((cs) => cs.filter((c) => c.id !== id));
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return [
    clients,
    {
      loading,
      error,
      createClient,
      updateClient,
      deleteClient,
    },
  ] as const;
}

export default useClients;
