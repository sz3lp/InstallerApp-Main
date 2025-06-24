import React, { useEffect, useState } from "react";
import { SZButton } from "../ui/SZButton";
import { SZInput } from "../ui/SZInput";
import { SZCard } from "../ui/SZCard";
import useAuth from "../../lib/hooks/useAuth";
import { useJobs } from "../../lib/hooks/useJobs";
import useQuotes from "../../lib/hooks/useQuotes";
import useClients from "../../lib/hooks/useClients";
import useInvoices from "../../lib/hooks/useInvoices";
import supabase from "../../lib/supabaseClient";

const GenerateInvoicePanel: React.FC = () => {
  const { role } = useAuth();
  const { jobs, fetchJobs } = useJobs();
  const [quotes] = useQuotes();
  const [clients] = useClients();
  const [, { generateFromJob, updateInvoice }] = useInvoices();

  const [jobId, setJobId] = useState("");
  const [quoteId, setQuoteId] = useState("");
  const [clientId, setClientId] = useState("");
  const [discountType, setDiscountType] = useState<"flat" | "percent">("flat");
  const [discount, setDiscount] = useState("0");
  const [taxRate, setTaxRate] = useState("0");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      if ((job as any).quote_id) {
        setQuoteId((job as any).quote_id);
      }
      if (job.client_id) {
        setClientId(job.client_id);
      }
    }
  }, [jobId, jobs]);

  useEffect(() => {
    const q = quotes.find((q) => q.id === quoteId);
    if (q) {
      setClientId(q.client_id ?? "");
    }
  }, [quoteId, quotes]);

  if (role !== "Admin") return null;

  const approvedJobs = jobs.filter(
    (j) => j.status === "approved_ready_for_invoice_payroll",
  );

  const handleGenerate = async () => {
    if (!jobId) return;
    setLoading(true);
    setMessage(null);
    try {
      const invId = await generateFromJob(jobId);
      const { data } = await supabase
        .from("invoices")
        .select("subtotal")
        .eq("id", invId)
        .single();
      const subtotal = data?.subtotal ?? 0;
      const discountVal =
        discountType === "percent"
          ? ((Number(discount) || 0) * subtotal) / 100
          : Number(discount) || 0;
      const taxRateNum = Number(taxRate) || 0;
      const taxAmt = ((subtotal - discountVal) * taxRateNum) / 100;
      const total = subtotal - discountVal + taxAmt;
      await updateInvoice(invId, {
        quote_id: quoteId || null,
        client_id: clientId || null,
        discount_type: discountType,
        discount_amount: discountVal,
        tax_rate: taxRateNum,
        tax_amount: taxAmt,
        total_fees: 0,
        invoice_total: total,
      });
      setMessage("Invoice generated.");
    } catch (e: any) {
      console.error(e);
      setMessage(e.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SZCard header={<h2 className="font-semibold">Generate Invoice</h2>}>
      <div className="space-y-3">
        <div>
          <label htmlFor="job" className="block text-sm font-medium text-gray-700">
            Job
          </label>
          <select
            id="job"
            className="border rounded px-2 py-1 w-full"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
          >
            <option value="">Select</option>
            {approvedJobs.map((j) => (
              <option key={j.id} value={j.id}>
                {(j as any).clinic_name || j.id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="quote" className="block text-sm font-medium text-gray-700">
            Quote
          </label>
          <select
            id="quote"
            className="border rounded px-2 py-1 w-full"
            value={quoteId}
            onChange={(e) => setQuoteId(e.target.value)}
          >
            <option value="">None</option>
            {quotes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title ?? q.id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="client" className="block text-sm font-medium text-gray-700">
            Client
          </label>
          <select
            id="client"
            className="border rounded px-2 py-1 w-full"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">Select</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Discount</label>
          <div className="flex items-center gap-2 mt-1">
            <select
              className="border rounded p-1"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as any)}
            >
              <option value="flat">$</option>
              <option value="percent">%</option>
            </select>
            <input
              type="number"
              className="border rounded p-1 w-full"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
        </div>
        <SZInput
          id="tax"
          label="Tax Rate %"
          type="number"
          value={taxRate}
          onChange={setTaxRate}
        />
        {message && <p className="text-sm">{message}</p>}
        <div className="pt-1">
          <SZButton onClick={handleGenerate} isLoading={loading} disabled={!jobId}>
            Generate Invoice
          </SZButton>
        </div>
      </div>
    </SZCard>
  );
};

export default GenerateInvoicePanel;

