import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";
import { Invoice } from "./useInvoices";

export default function useInvoice(id: string | null) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    if (!id) {
      setInvoice(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select(
        "id, job_id, quote_id, client_id, subtotal, discount_type, discount_amount, tax_rate, tax_amount, total_fees, invoice_total, amount_paid, payment_status, payment_method, stripe_session_id, invoice_date, due_date, paid_at, clients(name), jobs(clinic_name)",
      )
      .eq("id", id)
      .single();
    if (error) {
      setError(error.message);
      setInvoice(null);
    } else {
      setInvoice({
        ...(data as any),
        issued_at: (data as any).invoice_date,
        amount: (data as any).invoice_total,
        client_name: (data as any).clients?.name ?? null,
        job_name: (data as any).jobs?.clinic_name ?? null,
        amount_paid: (data as any).amount_paid ?? 0,
        payment_status: (data as any).payment_status ?? "unpaid",
        payment_method: (data as any).payment_method ?? null,
        stripe_session_id: (data as any).stripe_session_id ?? null,
      } as Invoice);
      setError(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  return { invoice, loading, error, refresh: fetchInvoice } as const;
}
