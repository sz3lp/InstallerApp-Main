import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface InvoiceLineItem {
  id: string;
  material_id: string | null;
  description: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Invoice {
  id: string;
  job_id: string | null;
  quote_id: string | null;
  client_id: string | null;
  subtotal: number;
  discount_type: string | null;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total_fees: number;
  invoice_total: number;
  stripe_session_id?: string | null;
  amount: number; // alias for invoice_total for older components
  payment_status: string;
  amount_paid: number;
  payment_method: string | null;
  issued_at: string;
  due_date: string | null;
  paid_at: string | null;
  client_name?: string | null;
  client_email?: string | null;
  job_name?: string | null;
  line_items?: InvoiceLineItem[];
}

export interface InvoiceFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
}

export function useInvoices(filters: InvoiceFilters = {}) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("invoices")
      .select(
        "id, job_id, quote_id, client_id, subtotal, discount_type, discount_amount, tax_rate, tax_amount, total_fees, invoice_total, amount_paid, payment_status, payment_method, stripe_session_id, invoice_date, due_date, paid_at, clients(name, contact_email), jobs(clinic_name), invoice_line_items(id, material_id, description, quantity, unit_price, line_total)"
      )
      .order("invoice_date", { ascending: false });
    if (filters.status) query = query.eq("payment_status", filters.status);
    if (filters.startDate) query = query.gte("invoice_date", filters.startDate);
    if (filters.endDate) query = query.lte("invoice_date", filters.endDate);
    const { data, error } = await query;
    if (error) {
      setError(error);
      setInvoices([]);
    } else {
      const list = (data ?? []).map((i: any) => ({
        ...i,
        issued_at: i.invoice_date,
        amount: i.invoice_total,
        client_name: i.clients?.name ?? null,
        client_email: i.clients?.contact_email ?? null,
        job_name: i.jobs?.clinic_name ?? null,
        amount_paid: i.amount_paid ?? 0,
        payment_status: i.payment_status ?? "unpaid",
        payment_method: i.payment_method ?? null,
        stripe_session_id: i.stripe_session_id ?? null,
        line_items: i.invoice_line_items ?? [],
      }));
      setInvoices(list);
      setError(null);
    }
    setLoading(false);
  }, []);

  const createInvoice = useCallback(
    async (
      invoice: Omit<
        Invoice,
        "id" | "issued_at" | "paid_at" | "client_name" | "job_name" | "amount"
      > & { status?: string },
    ) => {
      const insertData = {
        job_id: invoice.job_id ?? null,
        quote_id: invoice.quote_id ?? null,
        client_id: invoice.client_id ?? null,
        subtotal: invoice.subtotal,
        discount_type: invoice.discount_type,
        discount_amount: invoice.discount_amount,
        tax_rate: invoice.tax_rate,
        tax_amount: invoice.tax_amount,
        total_fees: invoice.total_fees,
        invoice_total: invoice.invoice_total,
        due_date: invoice.due_date ?? null,
        payment_status: invoice.payment_status ?? "unpaid",
        amount_paid: invoice.amount_paid ?? 0,
        payment_method: invoice.payment_method ?? null,
      };
      const { data, error } = await supabase
        .from("invoices")
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      setInvoices((list) => [
        {
          ...data,
          client_name: (data as any).clients?.name ?? null,
          client_email: (data as any).clients?.contact_email ?? null,
          job_name: (data as any).jobs?.clinic_name ?? null,
          amount_paid: (data as any).amount_paid ?? 0,
          payment_status: (data as any).payment_status ?? "unpaid",
          payment_method: (data as any).payment_method ?? null,
          line_items: [],
        },
        ...list,
      ]);
      return data as Invoice;
    },
    [],
  );

  const updateInvoice = useCallback(
    async (
      id: string,
      invoice: Partial<
        Omit<
          Invoice,
          "id" | "issued_at" | "client_name" | "job_name" | "amount"
        >
      >,
    ) => {
      const { data, error } = await supabase
        .from("invoices")
        .update(invoice)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setInvoices((list) =>
        list.map((inv) => (inv.id === id ? { ...inv, ...data } : inv)),
      );
      return data as Invoice;
    },
    [],
  );

  const deleteInvoice = useCallback(async (id: string) => {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) throw error;
    setInvoices((list) => list.filter((inv) => inv.id !== id));
  }, []);

  const generateFromJob = useCallback(
    async (jobId: string) => {
      const { data, error } = await supabase
        .rpc("generate_invoice_from_job", { p_job_id: jobId })
        .single();
      if (error) throw error;
      await fetchInvoices();
      return data?.id as string;
    },
    [fetchInvoices],
  );

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices, filters.status, filters.startDate, filters.endDate]);

  return [
    invoices,
    {
      data: invoices,
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
