import React, { useState } from "react";
import { SZButton } from "../../components/ui/SZButton";
import { SZInput } from "../../components/ui/SZInput";
import { SZTable } from "../../components/ui/SZTable";
import ModalWrapper from "../../installer/components/ModalWrapper";

interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;
  timestamp: string;
}

const initialPayments: Payment[] = [
  {
    id: "1",
    invoiceId: "INV-1",
    amount: 500,
    method: "card",
    timestamp: "2024-05-01 10:00",
  },
];

const invoices = ["INV-1", "INV-2"];

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    invoiceId: invoices[0],
    amount: "",
    method: "",
  });

  const handleSave = () => {
    setPayments((ps) => [
      ...ps,
      {
        id: Date.now().toString(),
        invoiceId: form.invoiceId,
        amount: Number(form.amount),
        method: form.method,
        timestamp: new Date().toLocaleString(),
      },
    ]);
    setOpen(false);
    setForm({ invoiceId: invoices[0], amount: "", method: "" });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payments</h1>
        <SZButton size="sm" onClick={() => setOpen(true)}>
          Log Payment
        </SZButton>
      </div>
      <SZTable headers={["Amount", "Method", "Timestamp", "Invoice"]}>
        {payments.map((p) => (
          <tr key={p.id} className="border-t">
            <td className="p-2 border">${p.amount.toFixed(2)}</td>
            <td className="p-2 border">{p.method}</td>
            <td className="p-2 border">{p.timestamp}</td>
            <td className="p-2 border">{p.invoiceId}</td>
          </tr>
        ))}
      </SZTable>
      <ModalWrapper isOpen={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-semibold mb-4">Log Payment</h2>
        <div className="space-y-2">
          <SZInput
            id="pay_amount"
            label="Amount"
            value={form.amount}
            onChange={(v) => setForm((f) => ({ ...f, amount: v }))}
          />
          <SZInput
            id="pay_method"
            label="Method"
            value={form.method}
            onChange={(v) => setForm((f) => ({ ...f, method: v }))}
          />
          <div>
            <label
              htmlFor="pay_invoice"
              className="block text-sm font-medium text-gray-700"
            >
              Invoice
            </label>
            <select
              id="pay_invoice"
              className="border rounded px-3 py-2 w-full"
              value={form.invoiceId}
              onChange={(e) =>
                setForm((f) => ({ ...f, invoiceId: e.target.value }))
              }
            >
              {invoices.map((inv) => (
                <option key={inv} value={inv}>
                  {inv}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <SZButton variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </SZButton>
          <SZButton onClick={handleSave}>Save</SZButton>
        </div>
      </ModalWrapper>
    </div>
  );
};

export default PaymentsPage;
