import React, { useState } from "react";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import { useAuth } from "../../lib/hooks/useAuth";
import { Navigate } from "react-router-dom";

interface Invoice {
  id: string;
  client: string;
  amount: number;
  status: "paid" | "unpaid";
}

const initialInvoices: Invoice[] = [
  { id: "INV-1", client: "Acme Clinic", amount: 500, status: "unpaid" },
  { id: "INV-2", client: "Beta Labs", amount: 750, status: "paid" },
];

const InvoicesPage: React.FC = () => {
  const { session, isAuthorized, loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");

  const markPaid = (id: string) => {
    setInvoices((inv) =>
      inv.map((i) => (i.id === id ? { ...i, status: "paid" } : i)),
    );
  };

  if (authLoading) return <p className="p-4">Loading...</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (!isAuthorized("Manager") && !isAuthorized("Admin"))
    return <Navigate to="/unauthorized" replace />;

  const filtered = invoices.filter((i) =>
    filter === "all" ? true : i.status === filter,
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>
      <SZTable headers={["Invoice", "Client", "Amount", "Status", "Actions"]}>
        {filtered.map((inv) => (
          <tr key={inv.id} className="border-t">
            <td className="p-2 border">{inv.id}</td>
            <td className="p-2 border">{inv.client}</td>
            <td className="p-2 border">${inv.amount.toFixed(2)}</td>
            <td className="p-2 border">{inv.status}</td>
            <td className="p-2 border">
              {inv.status === "unpaid" && (
                <SZButton size="sm" onClick={() => markPaid(inv.id)}>
                  Mark as Paid
                </SZButton>
              )}
            </td>
          </tr>
        ))}
      </SZTable>
    </div>
  );
};

export default InvoicesPage;
