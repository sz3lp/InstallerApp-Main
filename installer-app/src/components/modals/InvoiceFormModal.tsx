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
  subtotal: number;
  discount_type: "flat" | "percent";
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total_fees: number;
  invoice_total: number;
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
  const [subtotal, setSubtotal] = useState("0");
  const [discountType, setDiscountType] = useState<"flat" | "percent">("flat");
  const [discount, setDiscount] = useState("0");
  const [taxRate, setTaxRate] = useState("0");
  const [fees, setFees] = useState<{ description: string; amount: string }[]>([]);
  const [dueDate, setDueDate] = useState("");

  const subtotalNum = Number(subtotal) || 0;
  const discountNum = Number(discount) || 0;
  const taxRateNum = Number(taxRate) || 0;
  const feeTotal = fees.reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const discountAmt =
    discountType === "percent" ? (subtotalNum * discountNum) / 100 : discountNum;
  const taxedBase = subtotalNum - discountAmt;
  const taxAmt = (taxRateNum / 100) * taxedBase;
  const grandTotal = taxedBase + taxAmt + feeTotal;

  useEffect(() => {
    if (initialData) {
      setClientId(initialData.client_id);
      setJobId(initialData.job_id ?? "");
      setQuoteId(initialData.quote_id ?? "");
      setSubtotal(String(initialData.subtotal));
      setDiscountType(initialData.discount_type);
      setDiscount(String(initialData.discount_amount));
      setTaxRate(String(initialData.tax_rate));
      setFees([]); // fees will be fetched separately if needed
      setDueDate(initialData.due_date ?? "");
    } else {
      setClientId("");
      setJobId("");
      setQuoteId("");
      setSubtotal("0");
      setDiscountType("flat");
      setDiscount("0");
      setTaxRate("0");
      setFees([]);
      setDueDate("");
    }
  }, [initialData]);

  useEffect(() => {
    if (quoteId) {
      const q = quotes.find((q) => q.id === quoteId);
      if (q) {
        setClientId(q.client_id ?? "");
        setSubtotal(String(q.total ?? 0));
      }
    } else if (jobId) {
      const j = jobs.find((j) => j.id === jobId);
      if (j && (j as any).quote_id) {
        const q = quotes.find((x) => x.id === (j as any).quote_id);
        if (q) {
          setClientId(q.client_id ?? "");
          setSubtotal(String(q.total ?? 0));
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
      subtotal: subtotalNum,
      discount_type: discountType,
      discount_amount: discountAmt,
      tax_rate: taxRateNum,
      tax_amount: taxAmt,
      total_fees: feeTotal,
      invoice_total: grandTotal,
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
          <SZInput id="inv_sub" label="Subtotal" value={subtotal} onChange={(v) => setSubtotal(v)} />
          <div>
            <label className="block text-sm font-medium text-gray-700">Discount</label>
            <div className="flex items-center gap-2 mt-1">
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="border rounded p-1">
                <option value="flat">$</option>
                <option value="percent">%</option>
              </select>
              <input type="number" className="border rounded p-1 w-full" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
          </div>
          <SZInput id="inv_tax" label="Tax Rate %" value={taxRate} onChange={(v) => setTaxRate(v)} />
          <div className="space-y-2">
            <p className="text-sm font-medium">Additional Fees</p>
            {fees.map((f, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <input type="text" placeholder="Description" className="border rounded p-1 flex-1" value={f.description} onChange={(e) => setFees((rows) => rows.map((r, i) => (i === idx ? { ...r, description: e.target.value } : r)))} />
                <input type="number" placeholder="Amount" className="border rounded p-1 w-28" value={f.amount} onChange={(e) => setFees((rows) => rows.map((r, i) => (i === idx ? { ...r, amount: e.target.value } : r)))} />
                <button type="button" className="text-red-600 text-xs" onClick={() => setFees((rows) => rows.filter((_, i) => i !== idx))}>Remove</button>
              </div>
            ))}
            <button type="button" className="text-blue-600 text-xs" onClick={() => setFees((r) => [...r, { description: '', amount: '' }])}>Add Fee</button>
          </div>
          <SZInput id="inv_due" label="Due Date" type="date" value={dueDate} onChange={(v) => setDueDate(v)} />
          <div className="text-sm border-t pt-2 space-y-1">
            <p>Discount: ${discountAmt.toFixed(2)}</p>
            <p>Tax: ${taxAmt.toFixed(2)}</p>
            <p>Fees: ${feeTotal.toFixed(2)}</p>
            <p className="font-semibold">Total: ${grandTotal.toFixed(2)}</p>
          </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <SZButton variant="secondary" onClick={onClose}>Cancel</SZButton>
        <SZButton onClick={handleSave}>Save</SZButton>
      </div>
    </ModalWrapper>
  );
};

export default InvoiceFormModal;
