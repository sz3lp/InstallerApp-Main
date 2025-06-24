import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import PaymentLoggingModal from "../../components/PaymentLoggingModal";
import useInvoice from "../../lib/hooks/useInvoice";
import usePayments from "../../lib/hooks/usePayments";
import useAuth from "../../lib/hooks/useAuth";
import { GlobalLoading, GlobalError } from "../../components/global-states";

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const { invoice, loading, error } = useInvoice(id ?? null);
  const [open, setOpen] = useState(false);
  const [payments] = usePayments(id ?? "");

  const handleSendInvoice = async (invoiceId: string) => {
    const res = await fetch("/functions/initiate_stripe_payment", {
      method: "POST",
      body: JSON.stringify({ invoice_id: invoiceId }),
    });
    const { url } = await res.json();
    window.open(url, "_blank");
  };

  const sendPaymentLink = async () => {
    const res = await fetch('/api/payments/initiate-payment-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_id: invoice.id }),
    });
    const data = await res.json();
    if (data.url) {
      window.open(data.url, '_blank');
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
      <div className="space-y-1">
        <p>Subtotal: ${invoice.subtotal.toFixed(2)}</p>
        <p>Discount: ${invoice.discount_amount.toFixed(2)}</p>
        <p>Tax: ${invoice.tax_amount.toFixed(2)}</p>
        <p>Fees: ${invoice.total_fees.toFixed(2)}</p>
        <p className="font-semibold">Total: ${invoice.invoice_total.toFixed(2)}</p>
      </div>
      <p>Amount Paid: ${totalPaid.toFixed(2)}</p>
      <p>Balance Due: ${balance.toFixed(2)}</p>
      {invoice.line_items && invoice.line_items.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mt-4">Line Items</h2>
          <SZTable headers={["Description", "Qty", "Price", "Total"]}>
            {invoice.line_items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2 border">{item.description}</td>
                <td className="p-2 border">{item.quantity}</td>
                <td className="p-2 border">${item.unit_price.toFixed(2)}</td>
                <td className="p-2 border">${item.line_total.toFixed(2)}</td>
              </tr>
            ))}
          </SZTable>
        </>
      )}
      {['Admin', 'Finance'].includes(role) && (
        <div className="flex gap-2">
          <SZButton size="sm" onClick={() => setOpen(true)}>
            Record Payment
          </SZButton>
          <SZButton size="sm" variant="secondary" onClick={sendPaymentLink}>
            Send Payment Link
          </SZButton>
      {["Admin", "Finance"].includes(role) && (
        <div className="flex gap-2">
          <SZButton size="sm" onClick={() => handleSendInvoice(invoice.id)}>
            Send Invoice
          </SZButton>
          <SZButton size="sm" onClick={() => setOpen(true)}>
            Record Payment
          </SZButton>

        </div>
      )}
      <h2 className="text-lg font-semibold mt-4">Payments</h2>
      <SZTable headers={["Amount", "Method", "Date", "Note"]}>
        {payments.map((p) => (
          <tr key={p.id} className="border-t">
            <td className="p-2 border">${p.amount.toFixed(2)}</td>
            <td className="p-2 border">{p.payment_method}</td>
            <td className="p-2 border">
              {new Date(p.payment_date).toLocaleDateString()}
            </td>
            <td className="p-2 border">{p.note || "-"}</td>
          </tr>
        ))}
      </SZTable>
      {open && (
        <PaymentLoggingModal
          invoiceId={invoice.id}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default InvoiceDetailPage;
