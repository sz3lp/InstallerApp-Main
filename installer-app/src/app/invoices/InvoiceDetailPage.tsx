import React from "react";
import { useParams } from "react-router-dom";
import { SZButton } from "../../components/ui/SZButton";
import ManualPaymentEntryPanel from "../../components/invoices/ManualPaymentEntryPanel";
import InvoicePaymentHistory from "../../components/invoices/InvoicePaymentHistory";
import supabase from "../../lib/supabaseClient";
import useInvoice from "../../lib/hooks/useInvoice";
import usePayments from "../../lib/hooks/usePayments";
import useAuth from "../../lib/hooks/useAuth";
import { GlobalLoading, GlobalError } from "../../components/global-states";

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const { invoice, loading, error } = useInvoice(id ?? null);
  const [payments, { fetchPayments }] = usePayments(id ?? "");

  const handlePayNow = async () => {
    if (!invoice) return;
    try {
      const { data, error } = await supabase.functions.invoke(
        "initiate_stripe_payment",
        {
          body: JSON.stringify({ invoice_id: invoice.id }),
        },
      );
      if (error) {
        console.error("Error initiating Stripe payment:", error);
        return;
      }
      const url = (data as any).stripeSessionUrl || (data as any).url;
      if (url) window.location.href = url as string;
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  if (loading) return <GlobalLoading />;
  if (error || !invoice)
    return <GlobalError message={error || "Invoice not found"} />;

  const totalPaid =
    invoice.amount_paid ?? payments.reduce((s, p) => s + p.amount, 0);
  const balance = invoice.invoice_total - totalPaid;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Invoice {invoice.id}</h1>
      <p>Client: {invoice.client_name}</p>
      <p>Total: ${invoice.invoice_total.toFixed(2)}</p>
      <p>Amount Paid: ${totalPaid.toFixed(2)}</p>
      <p>Balance Due: ${balance.toFixed(2)}</p>

      {invoice.payment_status === "unpaid" && (
        <SZButton size="sm" onClick={handlePayNow}>
          Pay Now
        </SZButton>
      )}

      {['Admin', 'Finance'].includes(role) && (
        <div className="space-y-4">
          <ManualPaymentEntryPanel
            invoiceId={invoice.id}
            onPaymentLogged={fetchPayments}
          />
        </div>
      )}

      <InvoicePaymentHistory invoiceId={invoice.id} />
    </div>
  );
};

export default InvoiceDetailPage;
