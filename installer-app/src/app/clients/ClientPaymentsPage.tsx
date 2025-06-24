import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SZTable } from "../../components/ui/SZTable";
import { GlobalLoading, GlobalError } from "../../components/global-states";
import supabase from "../../lib/supabaseClient";

interface PaymentRow {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
}

interface InvoiceData {
  id: string;
  invoice_total: number;
  payment_status: string;
  payments: PaymentRow[];
}

const ClientPaymentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [clientName, setClientName] = useState<string>("");
  const [data, setData] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("name")
        .eq("id", id)
        .single();
      setClientName((data as any)?.name || "");

      const { data: invoices, error: invErr } = await supabase
        .from("invoices")
        .select(
          "id, invoice_total, payment_status, payments(id, amount, payment_date, payment_method)"
        )
        .eq("client_id", id)
        .order("invoice_date", { ascending: false });

      if (invErr) {
        setError(invErr.message);
        setData([]);
      } else {
        setError(null);
        setData((invoices as any) || []);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <GlobalLoading />;
  if (error) return <GlobalError error={error} />;

  const totalRevenue = data.reduce(
    (s, inv) =>
      s + inv.payments.reduce((pSum, p) => pSum + (p.amount ?? 0), 0),
    0
  );

  const rows = data.flatMap((inv) =>
    inv.payments.length > 0
      ? inv.payments.map((p) => ({ invoice: inv, payment: p }))
      : [{ invoice: inv, payment: null }]
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">
        Payments for {clientName || id}
      </h1>
      <div className="font-semibold">Total Revenue: ${totalRevenue.toFixed(2)}</div>
      <SZTable
        headers={[
          "Invoice",
          "Total",
          "Status",
          "Payment Date",
          "Amount",
          "Method",
        ]}
      >
        {rows.map(({ invoice, payment }) => (
          <tr key={`${invoice.id}-${payment?.id || "none"}`} className="border-t">
            <td className="p-2 border">
              <a className="text-blue-600 underline" href={`/invoices/${invoice.id}`}>{invoice.id}</a>
            </td>
            <td className="p-2 border">${invoice.invoice_total.toFixed(2)}</td>
            <td className="p-2 border">{invoice.payment_status}</td>
            {payment ? (
              <>
                <td className="p-2 border">{new Date(payment.payment_date).toLocaleDateString()}</td>
                <td className="p-2 border">${payment.amount.toFixed(2)}</td>
                <td className="p-2 border">{payment.payment_method}</td>
              </>
            ) : (
              <td className="p-2 border" colSpan={3}>
                No payments
              </td>
            )}
          </tr>
        ))}
      </SZTable>
    </div>
  );
};

export default ClientPaymentsPage;
