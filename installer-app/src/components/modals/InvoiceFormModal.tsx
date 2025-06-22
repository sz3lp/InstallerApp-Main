import React, { useState, useEffect } from "react";
import ModalWrapper from "../../installer/components/ModalWrapper";
import { SZButton } from "../ui/SZButton";
import { SZInput } from "../ui/SZInput";
import useClients from "../../lib/hooks/useClients";
import { useJobs } from "../../lib/hooks/useJobs";
import useQuotes from "../../lib/hooks/useQuotes";

export interface InvoiceData {
  id?: string;
  client_id: string;
  job_id?: string;
  quote_id?: string;
  amount: number;
  due_date?: string;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InvoiceData) => void;
  initialData?: InvoiceData | null;
};

const InvoiceFormModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const [clients] = useClients();
  const { jobs } = useJobs();
  const [quotes] = useQuotes();

  const [clientId, setClientId] = useState("");
  const [jobId, setJobId] = useState("");
  const [quoteId, setQuoteId] = useState("");
  const [amount, setAmount] = useState("0");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (initialData) {
      setClientId(initialData.client_id);
      setJobId(initialData.job_id ?? "");
      setQuoteId(initialData.quote_id ?? "");
      setAmount(String(initialData.amount));
      setDueDate(initialData.due_date ?? "");
    } else {
      setClientId("");
      setJobId("");
      setQuoteId("");
      setAmount("0");
      setDueDate("");
    }
  }, [initialData]);

  useEffect(() => {
    if (quoteId) {
      const q = quotes.find((q) => q.id === quoteId);
      if (q) {
        setClientId(q.client_id ?? "");
        setAmount(String(q.total ?? 0));
      }
    } else if (jobId) {
      const j = jobs.find((j) => j.id === jobId);
      if (j && (j as any).quote_id) {
        const q = quotes.find((x) => x.id === (j as any).quote_id);
        if (q) {
          setClientId(q.client_id ?? "");
          setAmount(String(q.total ?? 0));
          setQuoteId(q.id);
        }
      }
    }
  }, [quoteId, jobId, quotes, jobs]);

  const handleSave = () => {
    onSave({
      id: initialData?.id,
      client_id: clientId,
      job_id: jobId || undefined,
      quote_id: quoteId || undefined,
      amount: Number(amount),
      due_date: dueDate || undefined,
    });
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">{initialData ? "Edit Invoice" : "New Invoice"}</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="inv_client" className="block text-sm font-medium text-gray-700">Client</label>
          <select id="inv_client" className="border rounded px-3 py-2 w-full" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">Select</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="inv_job" className="block text-sm font-medium text-gray-700">Job</label>
          <select id="inv_job" className="border rounded px-3 py-2 w-full" value={jobId} onChange={(e) => setJobId(e.target.value)}>
            <option value="">None</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.clinic_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="inv_quote" className="block text-sm font-medium text-gray-700">Quote</label>
          <select id="inv_quote" className="border rounded px-3 py-2 w-full" value={quoteId} onChange={(e) => setQuoteId(e.target.value)}>
            <option value="">None</option>
            {quotes.map((q) => (
              <option key={q.id} value={q.id}>{q.title ?? q.client_name}</option>
            ))}
          </select>
        </div>
        <SZInput id="inv_amount" label="Amount" value={amount} onChange={(v) => setAmount(v)} />
        <SZInput id="inv_due" label="Due Date" type="date" value={dueDate} onChange={(v) => setDueDate(v)} />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <SZButton variant="secondary" onClick={onClose}>Cancel</SZButton>
        <SZButton onClick={handleSave}>Save</SZButton>
      </div>
    </ModalWrapper>
  );
};

export default InvoiceFormModal;
