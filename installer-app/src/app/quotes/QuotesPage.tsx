import React, { useState } from "react";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import QuoteFormModal, {
  QuoteData,
} from "../../components/modals/QuoteFormModal";
import { useJobs } from "../../lib/hooks/useJobs";

const initialQuotes: QuoteData[] = [
  { id: "1", client: "Acme Clinic", lines: [], total: 1500 },
  { id: "2", client: "Beta Labs", lines: [], total: 2300 },
];

const QuotesPage: React.FC = () => {
  const [quotes, setQuotes] = useState(
    initialQuotes.map((q) => ({ ...q, status: "pending" })) as (QuoteData & {
      status: string;
    })[],
  );
  const [active, setActive] = useState<
    (QuoteData & { status?: string }) | null
  >(null);
  const [open, setOpen] = useState(false);
  const { createJob } = useJobs();

  const handleSave = (data: QuoteData) => {
    if (data.id) {
      setQuotes((qs) =>
        qs.map((q) => (q.id === data.id ? { ...q, ...data } : q)),
      );
    } else {
      const id = Date.now().toString();
      setQuotes((qs) => [...qs, { ...data, id, status: "pending" }]);
    }
    setOpen(false);
    setActive(null);
  };

  const approve = async (id: string) => {
    const quote = quotes.find((q) => q.id === id);
    if (!quote) return;
    await createJob({
      clinic_name: quote.client,
      contact_name: "",
      contact_phone: "",
    });
    setQuotes((qs) =>
      qs.map((q) => (q.id === id ? { ...q, status: "approved" } : q)),
    );
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
            <td className="p-2 border">{q.client}</td>
            <td className="p-2 border">${(q.total ?? 0).toFixed(2)}</td>
            <td className="p-2 border">{(q as any).status}</td>
            <td className="p-2 border space-x-2">
              {(q as any).status === "pending" && (
                <SZButton size="sm" onClick={() => approve(q.id!)}>
                  Approve
                </SZButton>
              )}
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
