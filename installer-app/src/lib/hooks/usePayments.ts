import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface Payment {
  id: string;
  invoice_id: string | null;
  job_id: string | null;
  client_id: string | null;
  amount: number;
  payment_method: string | null;
  reference_number: string | null;
  payment_date: string;
  logged_by_user_id: string | null;
}

export function usePayments(invoiceId?: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("payments")
      .select(
        "id, invoice_id, job_id, client_id, amount, payment_method, reference_number, payment_date, logged_by_user_id",
      )
      .order("payment_date", { ascending: false });
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
    async (
      payment: Omit<
        Payment,
        "id" | "payment_date" | "logged_by_user_id"
      > & { payment_date?: string }
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const insertData = {
        ...payment,
        payment_date: payment.payment_date ?? new Date().toISOString(),
        logged_by_user_id: user?.id,
      };
      const { data, error } = await supabase
        .from("payments")
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      setPayments((ps) => [data, ...ps]);

      if (payment.invoice_id) {
        const { data: inv } = await supabase
          .from("invoices")
          .select("total_due, amount")
          .eq("id", payment.invoice_id)
          .single();
        const { data: sums } = await supabase
          .from("payments")
          .select("amount")
          .eq("invoice_id", payment.invoice_id);
        const total = inv?.total_due ?? inv?.amount ?? 0;
        const totalPaid = (sums ?? []).reduce((s: number, p: any) => s + p.amount, 0);
        let status = "unpaid";
        if (totalPaid >= total) status = "paid";
        else if (totalPaid > 0) status = "partially_paid";
        await supabase
          .from("invoices")
          .update({ status, paid_at: status === "paid" ? new Date().toISOString() : null })
          .eq("id", payment.invoice_id);
      }

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
