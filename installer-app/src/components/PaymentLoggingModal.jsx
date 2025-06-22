import React, { useState } from 'react';
import ModalWrapper from '../installer/components/ModalWrapper';
import { SZButton } from './ui/SZButton';
import { SZInput } from './ui/SZInput';
import usePayments from '../lib/hooks/usePayments';
import useAuth from '../lib/hooks/useAuth';
import useInvoices from '../lib/hooks/useInvoices';
import { useJobs } from '../lib/hooks/useJobs';
import useClients from '../lib/hooks/useClients';

export default function PaymentLoggingModal({ invoiceId = null, jobId = null, clientId = null, open, onClose }) {
  const { role } = useAuth();
  const [, { createPayment }] = usePayments();
  const [invoices] = useInvoices();
  const { jobs } = useJobs();
  const [clients] = useClients();

  const [type, setType] = useState(invoiceId ? 'invoice' : jobId ? 'job' : 'client');
  const [selectedInvoice, setSelectedInvoice] = useState(invoiceId || '');
  const [selectedJob, setSelectedJob] = useState(jobId || '');
  const [selectedClient, setSelectedClient] = useState(clientId || '');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [reference, setReference] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  if (!['Admin', 'Manager', 'Sales', 'Installer'].includes(role)) return null;
  const save = async () => {
    await createPayment({
      invoice_id: type === 'invoice' ? selectedInvoice || null : null,
      job_id: type === 'job' ? selectedJob || null : null,
      client_id: type === 'client' ? selectedClient || null : null,
      amount: Number(amount),
      payment_method: method,
      reference_number: reference || null,
      payment_date: date,
    });
    onClose();
  };

  return (
    <ModalWrapper isOpen={open} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-2">Log Payment</h2>
      <div className="my-2">
        <label className="block text-sm font-medium" htmlFor="type">Apply To</label>
        <select
          id="type"
          className="border rounded px-2 py-1 w-full"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="invoice">Invoice</option>
          <option value="job">Job (Deposit)</option>
          <option value="client">Client Account</option>
        </select>
      </div>
      {type === 'invoice' && (
        <div className="my-2">
          <label htmlFor="invoice" className="block text-sm font-medium">
            Invoice
          </label>
          <select
            id="invoice"
            className="border rounded px-2 py-1 w-full"
            value={selectedInvoice}
            onChange={(e) => setSelectedInvoice(e.target.value)}
          >
            <option value="">Select</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.id}
              </option>
            ))}
          </select>
        </div>
      )}
      {type === 'job' && (
        <div className="my-2">
          <label htmlFor="job" className="block text-sm font-medium">
            Job
          </label>
          <select
            id="job"
            className="border rounded px-2 py-1 w-full"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            <option value="">Select</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.clinic_name || j.id}
              </option>
            ))}
          </select>
        </div>
      )}
      {type === 'client' && (
        <div className="my-2">
          <label htmlFor="client" className="block text-sm font-medium">
            Client
          </label>
          <select
            id="client"
            className="border rounded px-2 py-1 w-full"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            <option value="">Select</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <SZInput id="amt" label="Amount" type="number" value={amount} onChange={setAmount} />
      <div className="my-2">
        <label className="block text-sm font-medium" htmlFor="method">Method</label>
        <select id="method" className="border rounded px-2 py-1 w-full" value={method} onChange={e => setMethod(e.target.value)}>
          <option value="Cash">Cash</option>
          <option value="Check">Check</option>
          <option value="Credit Card (Manual Entry)">Credit Card (Manual Entry)</option>
          <option value="Credit Card (POS/Gateway)">Credit Card (POS/Gateway)</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Client Portal">Client Portal</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <SZInput id="ref" label="Reference #" value={reference} onChange={setReference} />
      <div className="my-2">
        <label htmlFor="date" className="block text-sm font-medium">Payment Date</label>
        <input
          id="date"
          type="date"
          className="border rounded px-2 py-1 w-full"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <SZButton variant="secondary" onClick={onClose}>Cancel</SZButton>
        <SZButton onClick={save}>Save</SZButton>
      </div>
    </ModalWrapper>
  );
}
