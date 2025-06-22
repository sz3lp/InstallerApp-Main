import React, { useMemo } from "react";
import { SZTable } from "../../components/ui/SZTable";
import useInvoices from "../../lib/hooks/useInvoices";

const InvoiceAgingPage: React.FC = () => {
  const [invoices, { loading, error }] = useInvoices();

  const withAging = useMemo(() => {
    return invoices.map((inv) => {
      const due = inv.due_date ? new Date(inv.due_date).getTime() : null;
      let days = 0;
      if (due && !inv.paid_at) {
        const diff = Date.now() - due;
        days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days < 0) days = 0;
      }
      return { ...inv, days };
    });
  }, [invoices]);

  const buckets = useMemo(() => {
    const b = { "0-30": 0, "31-60": 0, "61-90": 0, "91+": 0 } as Record<string, number>;
    withAging.forEach((inv) => {
      const amt = inv.amount ?? 0;
      if (inv.days <= 30) b["0-30"] += amt;
      else if (inv.days <= 60) b["31-60"] += amt;
      else if (inv.days <= 90) b["61-90"] += amt;
      else b["91+"] += amt;
    });
    return b;
  }, [withAging]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">AR Aging Report</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(buckets).map(([label, total]) => (
          <div key={label} className="bg-white shadow rounded p-4">
            <p className="text-sm text-gray-600">{label} days</p>
            <p className="text-lg font-semibold">${total.toFixed(2)}</p>
          </div>
        ))}
      </div>
      <SZTable headers={["Invoice", "Client", "Issued", "Due", "Status", "Amount", "Days Overdue"]}>
        {withAging.map((inv) => (
          <tr key={inv.id} className="border-t">
            <td className="p-2 border">{inv.id}</td>
            <td className="p-2 border">{inv.client_name}</td>
            <td className="p-2 border">{new Date(inv.issued_at).toLocaleDateString()}</td>
            <td className="p-2 border">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : ""}</td>
            <td className="p-2 border">{inv.status}</td>
            <td className="p-2 border">${inv.amount.toFixed(2)}</td>
            <td className="p-2 border">{inv.days}</td>
          </tr>
        ))}
      </SZTable>
    </div>
  );
};

export default InvoiceAgingPage;
