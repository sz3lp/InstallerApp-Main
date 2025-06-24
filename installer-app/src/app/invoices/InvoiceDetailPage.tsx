import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { SZButton } from "../../components/ui/SZButton";
import SZStripeLinkSender from "../../components/payments/SZStripeLinkSender";
import { SZTable } from "../../components/ui/SZTable";
import ManualPaymentEntryPanel from "../../components/invoices/ManualPaymentEntryPanel";
import InvoicePaymentHistory from "../../components/invoices/InvoicePaymentHistory";
import useInvoice from "../../lib/hooks/useInvoice";
import usePayments from "../../lib/hooks/usePayments";
import useAuth from "../../lib/hooks/useAuth";
import { GlobalLoading, GlobalError } from "../../components/global-states";
import supabase from "../../lib/supabaseClient";

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const { invoice, loading, error, refresh } = useInvoice(id ?? null);
  const [payments, { fetchPayments }] = usePayments(id ?? "");


  const updateStatus = async (status: "paid" | "unpaid") => {
    if (!invoice) return;
    await supabase.rpc("update_invoice_status", {
      invoice_id: invoice.id,
      status,
    });
    refresh();
  };

  if (loading) return <GlobalLoading />;
  if (error || !invoice)
    return <GlobalError message={error || "Invoice not found"} />;

  const totalPaid =
    invoice.amount_paid ?? payments.reduce((s, p) => s + p.amount, 0);
  const balance = (invoice.invoice_total ?? 0) - totalPaid;

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

      {invoice.payment_status === "unpaid" && (
        <SZStripeLinkSender
          invoiceId={invoice.id}
          clientEmail={invoice.client_email ?? ""}
        />
      )}

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

      {["Admin", "Finance"].includes(role) && (
        <>
          <ManualPaymentEntryPanel
            invoiceId={invoice.id}
            onPaymentLogged={fetchPayments}
          />
          {role === "Admin" && (
            <SZButton
              size="sm"
              onClick={() =>
                updateStatus(invoice.payment_status === "paid" ? "unpaid" : "paid")
              }
            >
              {invoice.payment_status === "paid" ? "Mark as Unpaid" : "Mark as Paid"}
            </SZButton>
          )}
        </>
      )}

      <h2 className="text-lg font-semibold mt-4">Payments</h2>
      <InvoicePaymentHistory invoiceId={invoice.id} />
    </div>
  );
};

export default InvoiceDetailPage;
