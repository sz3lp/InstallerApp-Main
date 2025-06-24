import React, { useState } from "react";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import useInvoices from "../../lib/hooks/useInvoices";
import StatusFilter from "../../components/filters/StatusFilter";
import DateRangeFilter, { DateRange } from "../../components/filters/DateRangeFilter";
import InvoiceFormModal, { InvoiceData } from "../../components/modals/InvoiceFormModal";
import PaymentLoggingModal from "../../components/PaymentLoggingModal";
import LoadingFallback from "../../components/ui/LoadingFallback";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBoundary from "../../components/ui/ErrorBoundary";

const InvoicesPageContent: React.FC = () => {
  const [status, setStatus] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange>({ start: "", end: "" });
  const [
    invoices,
    { loading, error, fetchInvoices, createInvoice, updateInvoice },
  ] = useInvoices({ status, startDate: dateRange.start, endDate: dateRange.end });
  const [open, setOpen] = useState(false);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);

  React.useEffect(() => {
    if (error) {
      setToast({ message: error.message || 'Failed to load invoices', success: false });
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const markPaid = async (id: string) => {
    await updateInvoice(id, { payment_status: "paid", paid_at: new Date().toISOString() });
  };

  const openPaymentModal = (id: string) => {
    setPaymentInvoiceId(id);
  };

  const closePaymentModal = () => {
    setPaymentInvoiceId(null);
  };

  const filtered = invoices;

  const handleSave = async (data: InvoiceData) => {
    await createInvoice({
      client_id: data.client_id,
      job_id: data.job_id ?? null,
      quote_id: data.quote_id ?? null,
      subtotal: data.subtotal,
      discount_type: data.discount_type,
      discount_amount: data.discount_amount,
      tax_rate: data.tax_rate,
      tax_amount: data.tax_amount,
      total_fees: data.total_fees,
      invoice_total: data.invoice_total,
      due_date: data.due_date ?? null,
    });
    setOpen(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex flex-wrap gap-4 items-end">
          <StatusFilter
            options={[
              { value: "paid", label: "Paid" },
              { value: "partially_paid", label: "Partially Paid" },
              { value: "unpaid", label: "Unpaid" },
            ]}
            value={status}
            onChange={setStatus}
          />
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <SZButton size="sm" onClick={() => setOpen(true)}>
            New Invoice
          </SZButton>
        </div>
      </div>
      {loading && <LoadingFallback />}
      {error && (
        <EmptyState message={error.message || 'Failed to load invoices.'} />
      )}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState message="No Invoices" />
      )}
      {!loading && !error && filtered.length > 0 && (
        <SZTable headers={["Invoice", "Client", "Total", "Tax", "Discount", "Fees", "Paid", "Status", "Actions"]}>
          {filtered.map((inv) => (
            <tr key={inv.id} className="border-t">
              <td className="p-2 border">
                <a className="text-blue-600 underline" href={`/invoices/${inv.id}`}>{inv.id}</a>
              </td>
              <td className="p-2 border">{inv.client_name}</td>
              <td className="p-2 border">${inv.invoice_total.toFixed(2)}</td>
              <td className="p-2 border">${inv.tax_amount.toFixed(2)}</td>
              <td className="p-2 border">${inv.discount_amount.toFixed(2)}</td>
              <td className="p-2 border">${inv.total_fees.toFixed(2)}</td>
              <td className="p-2 border">${inv.amount_paid?.toFixed(2) ?? '0.00'}</td>
              <td className="p-2 border">{inv.payment_status}</td>
              <td className="p-2 border">
                {inv.payment_status !== "paid" && (
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
      {toast && (
        <div
          className={`fixed top-4 right-4 text-white px-4 py-2 rounded ${toast.success ? 'bg-green-600' : 'bg-red-600'}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

const InvoicesPage: React.FC = () => (
  <ErrorBoundary>
    <InvoicesPageContent />
  </ErrorBoundary>
);

export default InvoicesPage;
