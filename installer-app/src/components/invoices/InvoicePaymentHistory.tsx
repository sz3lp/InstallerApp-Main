import React from "react";
import usePayments from "../../lib/hooks/usePayments";
import { SZTable } from "../ui/SZTable";

interface Props {
  invoiceId: string;
}

const InvoicePaymentHistory: React.FC<Props> = ({ invoiceId }) => {
  const [payments, { loading, error }] = usePayments(invoiceId);

  if (loading) return <p>Loading payments...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!payments.length) return <p>No payments found for this invoice.</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Payment History</h3>
      <SZTable headers={["Date", "Amount", "Method", "Reference #"]}>
        {payments.map((p) => (
          <tr key={p.id} className="border-t">
            <td className="p-2 border">
              {new Date(p.payment_date).toLocaleDateString()}
            </td>
            <td className="p-2 border">${p.amount.toFixed(2)}</td>
            <td className="p-2 border">{p.payment_method}</td>
            <td className="p-2 border">{p.reference_number || "N/A"}</td>
          </tr>
        ))}
      </SZTable>
    </div>
  );
};

export default InvoicePaymentHistory;
