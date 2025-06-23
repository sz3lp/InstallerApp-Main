import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import QuoteFormModal, { QuoteData } from "../../components/modals/QuoteFormModal";
import useQuotes from "../../lib/hooks/useQuotes";
import { useAuth } from "../../lib/hooks/useAuth";

const QuotesPage: React.FC = () => {
  const { user, role } = useAuth();
  const [quotes, { loading, error, createQuote, updateQuote, updateQuoteStatus }] = useQuotes();
  const [active, setActive] = useState<QuoteData & { id?: string } | null>(null);
  const [open, setOpen] = useState(false);

  const handleSave = async (data: QuoteData) => {
    if (data.id) {
      await updateQuote(data.id, {
        client_id: data.client_id,
        items: data.lines.map((l) => ({
          description: l.material,
          quantity: l.qty,
          unit_price: l.price,
          total: l.qty * l.price,
        })),
      });
    } else {
      await createQuote({
        client_id: data.client_id,
        items: data.lines.map((l) => ({
          description: l.material,
          quantity: l.qty,
          unit_price: l.price,
          total: l.qty * l.price,
        })),
      });
    }
    setOpen(false);
    setActive(null);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <SZButton size="sm" onClick={() => setOpen(true)}>
          New Quote
        </SZButton>
      </div>
      {error && <div className="text-red-600">{error.message}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <SZTable headers={["Client", "Total", "Status", "Actions"]}>
          {quotes.map((q) => (
            <tr key={q.id} className="border-t">
              <td className="p-2 border">{q.client_name}</td>
              <td className="p-2 border">${(q.total ?? 0).toFixed(2)}</td>
              <td className="p-2 border">{q.status}</td>
              <td className="p-2 border space-x-2">
                <Link to={`/quotes/${q.id}`}>View</Link>
                {role === "Sales" && user?.id === q.created_by && q.status === "draft" && (
                  <SZButton size="sm" variant="secondary" onClick={() => { setActive(q as any); setOpen(true); }}>
                    Edit
                  </SZButton>
                )}
                {role === "Sales" && user?.id === q.created_by && q.status === "draft" && (
                  <SZButton size="sm" onClick={() => updateQuoteStatus(q.id, "pending")}>Submit</SZButton>
                )}
              </td>
            </tr>
          ))}
        </SZTable>
      )}
      <QuoteFormModal isOpen={open} onClose={() => setOpen(false)} onSave={handleSave} initialData={active ?? undefined} />
    </div>
  );
};

export default QuotesPage;
