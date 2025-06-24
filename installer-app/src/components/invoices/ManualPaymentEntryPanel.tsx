import React, { useState } from "react";
import supabase from "../../lib/supabaseClient";

interface Props {
  invoiceId: string;
  onPaymentLogged?: () => void;
}

const ManualPaymentEntryPanel: React.FC<Props> = ({ invoiceId, onPaymentLogged }) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!amount || !method || !paymentDate) {
      setMessage({ type: "error", text: "Please fill in all required fields: Amount, Method, Date." });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("payments").insert({
        invoice_id: invoiceId,
        amount: parseFloat(amount),
        payment_method: method,
        reference_number: referenceNumber || null,
        date: paymentDate,
      });
      if (error) throw error;
      setMessage({ type: "success", text: "Payment logged successfully!" });
      setAmount("");
      setMethod("");
      setReferenceNumber("");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      onPaymentLogged?.();
    } catch (err: any) {
      console.error("Error logging payment", err);
      setMessage({ type: "error", text: `Failed to log payment: ${err.message || "Unknown error"}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Manual Payment Entry</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount *
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            step="0.01"
            min="0"
            required
          />
        </div>
        <div>
          <label htmlFor="method" className="block text-sm font-medium text-gray-700">
            Method *
          </label>
          <select
            id="method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="">Select Method</option>
            <option value="Cash">Cash</option>
            <option value="Check">Check</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700">
            Reference Number
          </label>
          <input
            type="text"
            id="referenceNumber"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
            Date *
          </label>
          <input
            type="date"
            id="paymentDate"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        {message && (
          <div
            className={`p-2 rounded-md ${
              message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Logging Payment..." : "Log Payment"}
        </button>
      </form>
    </div>
  );
};

export default ManualPaymentEntryPanel;
