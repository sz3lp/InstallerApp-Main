import React, { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import useAuth from "../../lib/hooks/useAuth";
import { SZButton } from "../../components/ui/SZButton";
import { SZInput } from "../../components/ui/SZInput";
import { SZTable } from "../../components/ui/SZTable";
import { SZCard } from "../../components/ui/SZCard";

interface JobRow {
  id: string;
  clinic_name: string;
  client_id: string | null;
}

interface LineItem {
  material_id: string;
  description: string;
  quantity: number;
  unit_price: number;
}

const InvoiceGeneratorV2: React.FC = () => {
  const { role } = useAuth();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [jobId, setJobId] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [discountType, setDiscountType] = useState<"flat" | "percent">("flat");
  const [discount, setDiscount] = useState("0");
  const [taxRate, setTaxRate] = useState("0");
  const [saving, setSaving] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      const { data } = await supabase
        .from<JobRow>("jobs")
        .select("id, clinic_name, client_id")
        .eq("status", "ready_for_invoice");
      setJobs(data ?? []);
    };
    loadJobs();
  }, []);

  useEffect(() => {
    if (!jobId) {
      setLineItems([]);
      return;
    }
    const loadItems = async () => {
      const { data, error } = await supabase
        .from("job_quantities_completed")
        .select(
          "material_id, quantity_completed, materials(name, retail_price)"
        )
        .eq("job_id", jobId);
      if (error) {
        setError(error.message);
        setLineItems([]);
        return;
      }
      const items = (data ?? []).map((r: any) => ({
        material_id: r.material_id,
        description: r.materials?.name ?? "",
        quantity: r.quantity_completed ?? 0,
        unit_price: Number(r.materials?.retail_price) || 0,
      }));
      setLineItems(items);
      setError(null);
    };
    loadItems();
  }, [jobId]);

  const updateItem = (index: number, field: "quantity" | "unit_price", value: number) => {
    setLineItems((items) =>
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const subtotal = lineItems.reduce(
    (s, i) => s + i.quantity * i.unit_price,
    0
  );
  const discountNum = Number(discount) || 0;
  const discountAmount =
    discountType === "percent" ? (subtotal * discountNum) / 100 : discountNum;
  const taxedBase = subtotal - discountAmount;
  const taxRateNum = Number(taxRate) || 0;
  const taxAmount = (taxedBase * taxRateNum) / 100;
  const total = taxedBase + taxAmount;

  const saveInvoice = async () => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    setSaving(true);
    setError(null);
    const { data, error } = await supabase
      .from("invoices")
      .insert({
        client_id: job.client_id,
        job_id: jobId,
        subtotal,
        discount_type: discountType,
        discount_amount: discountAmount,
        tax_rate: taxRateNum,
        tax_amount: taxAmount,
        total_fees: 0,
        invoice_total: total,
        payment_status: "unpaid",
      })
      .select()
      .single();
    if (error) {
      setError(error.message);
    } else {
      setConfirmation(data?.id ?? null);
      await supabase.from("jobs").update({ status: "invoiced" }).eq("id", jobId);
    }
    setSaving(false);
  };

  if (!["Admin", "Sales", "Finance"].includes(role)) {
    return <div className="p-4">Access denied</div>;
  }

  if (confirmation) {
    return (
      <div className="p-4 space-y-2">
        <p>Invoice {confirmation} saved.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Invoice Generator</h1>
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
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.clinic_name}
            </option>
          ))}
        </select>
      </div>
      {lineItems.length > 0 && (
        <SZCard>
          <SZTable headers={["Item", "Qty", "Price", "Total"]}>
            {lineItems.map((it, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2 border">{it.description}</td>
                <td className="p-2 border">
                  <input
                    type="number"
                    className="border rounded w-24 p-1"
                    value={it.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", Number(e.target.value))
                    }
                  />
                </td>
                <td className="p-2 border">
                  <input
                    type="number"
                    className="border rounded w-24 p-1"
                    value={it.unit_price}
                    onChange={(e) =>
                      updateItem(idx, "unit_price", Number(e.target.value))
                    }
                  />
                </td>
                <td className="p-2 border">
                  ${(it.quantity * it.unit_price).toFixed(2)}
                </td>
              </tr>
            ))}
          </SZTable>
        </SZCard>
      )}
      {jobId && (
        <SZCard>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Discount
              </label>
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
            <div className="text-sm border-t pt-2 space-y-1">
              <p>Subtotal: ${subtotal.toFixed(2)}</p>
              <p>Discount: ${discountAmount.toFixed(2)}</p>
              <p>Tax: ${taxAmount.toFixed(2)}</p>
              <p className="font-semibold">Total: ${total.toFixed(2)}</p>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="pt-1">
              <SZButton onClick={saveInvoice} isLoading={saving} disabled={!jobId}>
                Save Invoice
              </SZButton>
            </div>
          </div>
        </SZCard>
      )}
    </div>
  );
};

export default InvoiceGeneratorV2;
