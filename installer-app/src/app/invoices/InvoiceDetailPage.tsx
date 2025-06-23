import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SZButton } from '../../components/ui/SZButton';
import { SZTable } from '../../components/ui/SZTable';
import PaymentLoggingModal from '../../components/PaymentLoggingModal';
import PayInvoiceButton from '../../components/PayInvoiceButton';
import useInvoice from '../../lib/hooks/useInvoice';
import usePayments from '../../lib/hooks/usePayments';
import useAuth from '../../lib/hooks/useAuth';
import { GlobalLoading, GlobalError } from '../../components/global-states';

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const { invoice, loading, error } = useInvoice(id ?? null);
  const [open, setOpen] = useState(false);
  const [payments] = usePayments(id ?? '');

  if (loading) return <GlobalLoading />;
  if (error || !invoice) return <GlobalError message={error || 'Invoice not found'} />;

  const totalPaid = invoice.amount_paid ?? payments.reduce((s, p) => s + p.amount, 0);
  const balance = invoice.invoice_total - totalPaid;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Invoice {invoice.id}</h1>
      <p>Client: {invoice.client_name}</p>
      <p>Total: ${invoice.invoice_total.toFixed(2)}</p>
      <p>Amount Paid: ${totalPaid.toFixed(2)}</p>
      <p>Balance Due: ${balance.toFixed(2)}</p>
      {['Admin', 'Finance'].includes(role) && (
        <SZButton size="sm" onClick={() => setOpen(true)}>
          Record Payment
        </SZButton>
      )}
      {balance > 0 && <PayInvoiceButton invoiceId={invoice.id} />}
      <h2 className="text-lg font-semibold mt-4">Payments</h2>
      <SZTable headers={["Amount", "Method", "Date", "Note"]}>
        {payments.map((p) => (
          <tr key={p.id} className="border-t">
            <td className="p-2 border">${p.amount.toFixed(2)}</td>
            <td className="p-2 border">{p.payment_method}</td>
            <td className="p-2 border">{new Date(p.payment_date).toLocaleDateString()}</td>
            <td className="p-2 border">{p.note || '-'}</td>
          </tr>
        ))}
      </SZTable>
      {open && (
        <PaymentLoggingModal invoiceId={invoice.id} open={open} onClose={() => setOpen(false)} />
      )}
    </div>
  );
};

export default InvoiceDetailPage;
