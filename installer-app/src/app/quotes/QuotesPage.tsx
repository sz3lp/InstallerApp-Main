import React, { useState } from "react";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import QuoteFormModal, { QuoteData } from "../../components/modals/QuoteFormModal";
import { useJobs } from "../../lib/hooks/useJobs";
import useQuotes from "../../lib/hooks/useQuotes";

const QuotesPage: React.FC = () => {
  const [quotes, { createQuote, updateQuote, deleteQuote }] = useQuotes();
  const [active, setActive] = useState<
    (QuoteData & { status?: string }) | null
  >(null);
  const [open, setOpen] = useState(false);
  const { createJob } = useJobs();

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

  const approve = async (id: string) => {
    const quote = quotes.find((q) => q.id === id);
    if (!quote) return;
    await createJob({
      clinic_name: quote.client_name ?? "",
      contact_name: "",
      contact_phone: "",
      quote_id: quote.id,
    });
    await updateQuote(id, {
      client_id: quote.client_id ?? "",
      status: "approved",
      title: quote.title ?? null,
      items: [],
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <SZButton
          size="sm"
          onClick={() => {
            setActive(null);
            setOpen(true);
          }}
        >
          New Quote
        </SZButton>
      </div>
      <SZTable headers={["Client", "Total", "Status", "Actions"]}>
        {quotes.map((q) => (
          <tr key={q.id} className="border-t">
            <td className="p-2 border">{q.client_name}</td>
            <td className="p-2 border">${(q.total ?? 0).toFixed(2)}</td>
            <td className="p-2 border">{q.status}</td>
            <td className="p-2 border space-x-2">
              {q.status === "draft" || q.status === "pending" ? (
                <SZButton size="sm" onClick={() => approve(q.id!)}>
                  Approve
                </SZButton>
              ) : null}
              <SZButton
                size="sm"
                variant="secondary"
                onClick={() => {
                  setActive(q);
                  setOpen(true);
                }}
              >
                Edit
              </SZButton>
              <SZButton
                size="sm"
                variant="destructive"
                onClick={() => deleteQuote(q.id)}
              >
                Delete
              </SZButton>
            </td>
          </tr>
        ))}
      </SZTable>
      <QuoteFormModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        initialData={active ?? undefined}
      />
    </div>
  );
};

export default QuotesPage;
