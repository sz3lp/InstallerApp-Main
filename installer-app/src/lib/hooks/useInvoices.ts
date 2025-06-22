import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface Invoice {
  id: string;
  job_id: string | null;
  quote_id: string | null;
  client_id: string | null;
  amount: number;
  status: string;
  issued_at: string;
  due_date: string | null;
  paid_at: string | null;
  client_name?: string | null;
  job_name?: string | null;
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select(
        "id, job_id, quote_id, client_id, amount, status, issued_at, due_date, paid_at, clients(name), jobs(clinic_name)"
      )
      .order("issued_at", { ascending: false });
    if (error) {
      setError(error.message);
      setInvoices([]);
    } else {
      const list = (data ?? []).map((i: any) => ({
        ...i,
        client_name: i.clients?.name ?? null,
        job_name: i.jobs?.clinic_name ?? null,
      }));
      setInvoices(list);
      setError(null);
    }
    setLoading(false);
  }, []);

  const createInvoice = useCallback(
    async (
      invoice: Omit<Invoice, "id" | "status" | "issued_at" | "paid_at" | "client_name" | "job_name"> & { status?: string }
    ) => {
      const { data, error } = await supabase
        .from("invoices")
        .insert({
          job_id: invoice.job_id ?? null,
          quote_id: invoice.quote_id ?? null,
          client_id: invoice.client_id ?? null,
          amount: invoice.amount,
          due_date: invoice.due_date ?? null,
          status: invoice.status ?? "unpaid",
        })
        .select()
        .single();
      if (error) throw error;
      setInvoices((list) => [{
        ...data,
        client_name: (data as any).clients?.name ?? null,
        job_name: (data as any).jobs?.clinic_name ?? null,
      }, ...list]);
      return data as Invoice;
    },
    []
  );

  const updateInvoice = useCallback(
    async (
      id: string,
      invoice: Partial<Omit<Invoice, "id" | "issued_at" | "client_name" | "job_name">>
    ) => {
      const { data, error } = await supabase
        .from("invoices")
        .update(invoice)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setInvoices((list) =>
        list.map((inv) => (inv.id === id ? { ...inv, ...data } : inv))
      );
      return data as Invoice;
    },
    []
  );

  const deleteInvoice = useCallback(async (id: string) => {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) throw error;
    setInvoices((list) => list.filter((inv) => inv.id !== id));
  }, []);

  const generateFromJob = useCallback(
    async (jobId: string) => {
      const { data, error } = await supabase
        .rpc("generate_invoice_for_job", { p_job_id: jobId })
        .single();
      if (error) throw error;
      await fetchInvoices();
      return data?.id as string;
    },
    [fetchInvoices],
  );

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return [
    invoices,
    {
      loading,
      error,
      fetchInvoices,
      createInvoice,
      updateInvoice,
      deleteInvoice,
      generateFromJob,
    },
  ] as const;
}

export default useInvoices;
