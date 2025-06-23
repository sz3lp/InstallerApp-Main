import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useAuth from "../../lib/hooks/useAuth";
import useInvoices from "../../lib/hooks/useInvoices";
import { useJobs } from "../../lib/hooks/useJobs";
import useQuotes from "../../lib/hooks/useQuotes";
import { SZInput } from "../../components/ui/SZInput";
import { SZButton } from "../../components/ui/SZButton";

export default function InvoiceBuilderPage() {
  const { role } = useAuth();
  const { createInvoice } = useInvoices()[1];
  const { jobs } = useJobs();
  const [quotes] = useQuotes();
  const [params] = useSearchParams();
  const jobId = params.get("job_id");

  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("0");

  useEffect(() => {
    if (jobId) {
      const j = jobs.find((j) => j.id === jobId);
      if (j && j.quote_id) {
        const q = quotes.find((x) => x.id === j.quote_id);
        if (q) {
          setClientId(q.client_id || "");
          setAmount(String(q.total || 0));
        }
      }
    }
  }, [jobId, jobs, quotes]);

  if (role !== "Install Manager" && role !== "Admin")
    return <div className="p-4">Access denied</div>;

  const save = async () => {
    const amt = Number(amount);
    await createInvoice({
      job_id: jobId,
      client_id: clientId,
      quote_id: undefined,
      subtotal: amt,
      discount_type: "flat",
      discount_amount: 0,
      tax_rate: 0,
      tax_amount: 0,
      total_fees: 0,
      invoice_total: amt,
      due_date: undefined,
      status: "draft",
    });
    alert("Invoice saved");
  };

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Invoice Builder</h1>
      <SZInput
        id="client"
        label="Client ID"
        value={clientId}
        onChange={setClientId}
      />
      <SZInput
        id="amount"
        label="Amount"
        type="number"
        value={amount}
        onChange={setAmount}
      />
      <SZButton onClick={save}>Save Invoice</SZButton>
    </div>
  );
}
