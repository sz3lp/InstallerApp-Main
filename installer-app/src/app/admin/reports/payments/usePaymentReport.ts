import { useEffect, useState } from 'react';
import supabase from '../../../../lib/supabaseClient';

export interface PaymentReportRow {
  id: string;
  payment_date: string;
  amount: number;
  payment_method: string | null;
  reference_number: string | null;
  invoice_id: string | null;
  job_id: string | null;
  client_id: string | null;
  logged_by_user_id: string | null;
  invoice_status: string | null;
  invoice_amount: number | null;
  client_name: string | null;
  job_name: string | null;
  user_name: string | null;
}

export interface PaymentReportFilters {
  date?: { start: string; end: string };
  method?: string;
  client?: string;
  status?: string[];
  amount?: { min?: string; max?: string };
}

export default function usePaymentReport(filters: PaymentReportFilters) {
  const [rows, setRows] = useState<PaymentReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase
        .from('payments')
        .select(
          'id, payment_date, amount, payment_method, reference_number, invoice_id, job_id, client_id, logged_by_user_id, invoices(amount,status), clients(name), jobs(name), users(name)'
        );
      if (filters.date?.start) query = query.gte('payment_date', filters.date.start);
      if (filters.date?.end) query = query.lte('payment_date', filters.date.end);
      if (filters.method) query = query.eq('payment_method', filters.method);
      if (filters.client) query = query.eq('client_id', filters.client);
      if (filters.status && filters.status.length > 0) query = query.in('invoices.payment_status', filters.status);
      if (filters.amount?.min) query = query.gte('amount', Number(filters.amount.min));
      if (filters.amount?.max) query = query.lte('amount', Number(filters.amount.max));
      const { data, error } = await query;
      if (error) {
        console.error(error);
        setRows([]);
      } else {
        const mapped = (data ?? []).map((p: any) => ({
          id: p.id,
          payment_date: p.payment_date,
          amount: p.amount,
          payment_method: p.payment_method,
          reference_number: p.reference_number,
          invoice_id: p.invoice_id,
          job_id: p.job_id,
          client_id: p.client_id,
          logged_by_user_id: p.logged_by_user_id,
          invoice_status: p.invoices?.payment_status ?? null,
          invoice_amount: p.invoices?.amount ?? null,
          client_name: p.clients?.name ?? null,
          job_name: p.jobs?.name ?? null,
          user_name: p.users?.name ?? null,
        }));
        setRows(mapped);
      }
      setLoading(false);
    }
    load();
  }, [JSON.stringify(filters)]);

  return { rows, loading };
}
