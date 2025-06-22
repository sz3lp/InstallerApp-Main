import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface Payment {
  id: string;
  invoice_id: string;
  method: string | null;
  amount: number;
  received_by: string | null;
  received_at: string;
}

export function usePayments(invoiceId?: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("payments")
      .select("id, invoice_id, method, amount, received_by, received_at")
      .order("received_at", { ascending: false });
    if (invoiceId) query = query.eq("invoice_id", invoiceId);
    const { data, error } = await query;
    if (error) {
      setError(error.message);
      setPayments([]);
    } else {
      setPayments(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [invoiceId]);

  const createPayment = useCallback(
    async (payment: Omit<Payment, "id" | "received_at" | "received_by">) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("payments")
        .insert({ ...payment, received_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      setPayments((ps) => [data, ...ps]);

      // update invoice status
      const { data: inv } = await supabase
        .from("invoices")
        .select("amount")
        .eq("id", payment.invoice_id)
        .single();
      const { data: sums } = await supabase
        .from("payments")
        .select("amount")
        .eq("invoice_id", payment.invoice_id);
      const totalPaid = (sums ?? []).reduce((s: number, p: any) => s + p.amount, 0);
      let status = "unpaid";
      if (totalPaid >= (inv?.amount ?? 0)) status = "paid";
      else if (totalPaid > 0) status = "partially_paid";
      await supabase
        .from("invoices")
        .update({ status, paid_at: status === "paid" ? new Date().toISOString() : null })
        .eq("id", payment.invoice_id);

      return data as Payment;
    },
    []
  );

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return [payments, { loading, error, fetchPayments, createPayment }] as const;
}

export default usePayments;
