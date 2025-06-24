import { useEffect, useState } from "react";
import supabase from "../../../../lib/supabaseClient";

export interface ARAgingReportRow {
  id: string;
  invoice_date: string;
  due_date: string | null;
  payment_status: string | null;
  balance_due: number;
  client_id: string | null;
  client_name: string | null;
  job_id: string | null;
  job_name: string | null;
  sales_rep_id: string | null;
  sales_rep_email: string | null;
  last_payment_method: string | null;
  days_overdue: number;
}

export interface ARAgingReportFilters {
  client?: string;
  status?: string[];
  balance?: { min?: string; max?: string };
  date?: { start?: string; end?: string };
  salesperson?: string;
}

export default function useARAgingReport(filters: ARAgingReportFilters) {
  const [rows, setRows] = useState<ARAgingReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase
        .from("invoices")
        .select(
          `id, invoice_date, due_date, payment_status, invoice_total, amount_paid, client_id, job_id, clients(name), jobs(id, clinic_name, origin_lead_id, leads(sales_rep_id, users(email))), payments(payment_method, payment_date)`,
        );
      if (filters.client) query = query.eq("client_id", filters.client);
      if (filters.status && filters.status.length > 0)
        query = query.in("payment_status", filters.status);
      if (filters.date?.start)
        query = query.gte("invoice_date", filters.date.start);
      if (filters.date?.end)
        query = query.lte("invoice_date", filters.date.end);
      if (filters.balance?.min)
        query = query.gte("invoice_total", Number(filters.balance.min));
      if (filters.balance?.max)
        query = query.lte("invoice_total", Number(filters.balance.max));
      const { data, error } = await query;
      if (error) {
        console.error(error);
        setRows([]);
        setLoading(false);
        return;
      }
      const mapped = (data ?? []).map((inv: any) => {
        const due = inv.due_date ? new Date(inv.due_date).getTime() : null;
        let days = 0;
        if (due && inv.payment_status !== "paid") {
          const diff = Date.now() - due;
          days = Math.floor(diff / (1000 * 60 * 60 * 24));
          if (days < 0) days = 0;
        }
        const payments = Array.isArray(inv.payments) ? inv.payments : [];
        payments.sort((a: any, b: any) =>
          (b.payment_date ?? "").localeCompare(a.payment_date ?? ""),
        );
        const last = payments[0];
        return {
          id: inv.id,
          invoice_date: inv.invoice_date,
          due_date: inv.due_date,
          payment_status: inv.payment_status,
          balance_due:
            Number(inv.invoice_total ?? 0) - Number(inv.amount_paid ?? 0),
          client_id: inv.client_id ?? null,
          client_name: inv.clients?.name ?? null,
          job_id: inv.job_id ?? null,
          job_name: inv.jobs?.clinic_name ?? null,
          sales_rep_id: inv.jobs?.leads?.sales_rep_id ?? null,
          sales_rep_email: inv.jobs?.leads?.users?.email ?? null,
          last_payment_method: last?.payment_method ?? null,
          days_overdue: days,
        } as ARAgingReportRow;
      });

      const filtered = mapped.filter((r) =>
        filters.salesperson ? r.sales_rep_id === filters.salesperson : true,
      );
      setRows(filtered);
      setLoading(false);
    }
    load();
  }, [JSON.stringify(filters)]);

  return { rows, loading } as const;
}
