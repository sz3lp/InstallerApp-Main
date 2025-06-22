import React, { useState } from "react";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import useInvoices from "../../lib/hooks/useInvoices";
import InvoiceFormModal, { InvoiceData } from "../../components/modals/InvoiceFormModal";
import PaymentLoggingModal from "../../components/PaymentLoggingModal";
import { LoadingState, EmptyState, ErrorState } from "../../components/ui/state";

const InvoicesPage: React.FC = () => {
  const [
    invoices,
    { loading, error, fetchInvoices, createInvoice, updateInvoice },
  ] = useInvoices();
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid" | "partially_paid">("all");
  const [open, setOpen] = useState(false);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);

  const markPaid = async (id: string) => {
    await updateInvoice(id, { status: "paid", paid_at: new Date().toISOString() });
  };

  const openPaymentModal = (id: string) => {
    setPaymentInvoiceId(id);
  };

  const closePaymentModal = () => {
    setPaymentInvoiceId(null);
  };

  const filtered = invoices.filter((i) => (filter === "all" ? true : i.status === filter));

  const handleSave = async (data: InvoiceData) => {
    await createInvoice({
      client_id: data.client_id,
      job_id: data.job_id ?? null,
      quote_id: data.quote_id ?? null,
      amount: data.amount,
      due_date: data.due_date ?? null,
    });
    setOpen(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex gap-2 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <SZButton size="sm" onClick={() => setOpen(true)}>
            New Invoice
          </SZButton>
        </div>
      </div>
      {loading && <LoadingState type="list" />}
      {error && <ErrorState message={error} onRetry={fetchInvoices} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No Invoices" description="No invoices found for this filter." />
      )}
      {!loading && !error && filtered.length > 0 && (
        <SZTable headers={["Invoice", "Client", "Amount", "Status", "Actions"]}>
          {filtered.map((inv) => (
            <tr key={inv.id} className="border-t">
              <td className="p-2 border">{inv.id}</td>
              <td className="p-2 border">{inv.client_name}</td>
              <td className="p-2 border">${inv.amount.toFixed(2)}</td>
              <td className="p-2 border">{inv.status}</td>
              <td className="p-2 border">
                {inv.status !== "paid" && (
                  <SZButton size="sm" onClick={() => markPaid(inv.id)}>
                    Mark Paid
                  </SZButton>
                )}
                <SZButton size="sm" variant="secondary" onClick={() => openPaymentModal(inv.id)}>
                  Log Payment
                </SZButton>
              </td>
            </tr>
          ))}
        </SZTable>
      )}
      <InvoiceFormModal isOpen={open} onClose={() => setOpen(false)} onSave={handleSave} />
      {paymentInvoiceId && (
        <PaymentLoggingModal invoiceId={paymentInvoiceId} open={true} onClose={closePaymentModal} />
      )}
    </div>
  );
};

export default InvoicesPage;
