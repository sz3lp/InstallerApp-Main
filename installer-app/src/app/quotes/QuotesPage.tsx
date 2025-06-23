import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import SearchAndFilterBar, {
  FilterOption,
} from "../../components/search/SearchAndFilterBar";
import QuoteFormModal, {
  QuoteData,
} from "../../components/modals/QuoteFormModal";
import useQuotes from "../../lib/hooks/useQuotes";
import supabase from "../../lib/supabaseClient";

type Toast = { message: string; success: boolean } | null;
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "../../components/states";

const statuses = ["draft", "pending", "approved"];

const QuotesPage: React.FC = () => {
  const navigate = useNavigate();
  const [
    quotes,
    {
      loading,
      error,
      fetchQuotes,
      createQuote,
      updateQuote,
      approveQuote,
      deleteQuote,
    },
  ] = useQuotes();
  const [active, setActive] = useState<
    (QuoteData & { status?: string }) | null
  >(null);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

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
    setToast(null);
    setApprovingId(id);
    try {
      await approveQuote(id);
      setToast({ message: "Quote approved!", success: true });
      await fetchQuotes();
    } catch (err: any) {
      setToast({ message: "Failed to approve quote: " + err.message, success: false });
    }
    setApprovingId(null);
    setTimeout(() => setToast(null), 3000);
  };

  const convertQuoteToJob = async (id: string) => {
    setToast(null);
    const { data, error } = await supabase.rpc("convert_quote_to_job", { quote_id: id });
    if (error) {
      setToast({ message: "Failed to convert quote: " + error.message, success: false });
    } else {
      setToast({ message: "Quote converted to job", success: true });
      navigate(`/jobs/${data}`);
    }
    setTimeout(() => setToast(null), 3000);
  };

  const searchFilterOptions: FilterOption[] = [
    { key: "status", label: "Status", options: statuses },
  ];

  const filteredQuotes = quotes.filter((q) => {
    if (statusFilter && q.status !== statusFilter) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      if (!(q.client_name ?? "").toLowerCase().includes(term)) return false;
    }
    return true;
  });

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

      {loading && <LoadingState />}
      {error && <ErrorState error={error} />}

      <SearchAndFilterBar
        searchPlaceholder="Search quotes"
        filters={searchFilterOptions}
        onSearch={setSearch}
        onFilterChange={(k, v) => setStatusFilter(v)}
      />
      {loading && <GlobalLoading />}
      {error && <GlobalError message={error} onRetry={fetchQuotes} />}
      {!loading && !error && quotes.length === 0 && (
        <div className="space-y-2">
          <EmptyState message="No Quotes Found" />
          <SZButton
            size="sm"
            onClick={() => {
              setActive(null);
              setOpen(true);
            }}
          >
            Create Quote
          </SZButton>
        </div>
      )}
      {!loading && !error && quotes.length > 0 && filteredQuotes.length === 0 && (
        <GlobalEmpty message="No Quotes Found" />
      )}
      {!loading && !error && quotes.length > 0 && filteredQuotes.length > 0 && (
        <SZTable headers={["Client", "Total", "Status", "Actions"]}>
          {filteredQuotes.map((q) => (
            <tr key={q.id} className="border-t">
              <td className="p-2 border">{q.client_name}</td>
              <td className="p-2 border">${(q.total ?? 0).toFixed(2)}</td>
              <td className="p-2 border">{q.status}</td>
              <td className="p-2 border space-x-2">
                {q.status === "draft" || q.status === "pending" ? (
                  <SZButton
                    size="sm"
                    onClick={() => approve(q.id!)}
                    isLoading={approvingId === q.id}
                    disabled={approvingId !== null && approvingId !== q.id}
                  >
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
                {q.status === "approved" && (
                  <SZButton size="sm" onClick={() => convertQuoteToJob(q.id!)}>
                    Convert to Job
                  </SZButton>
                )}
              </td>
            </tr>
          ))}
        </SZTable>
      )}
      <QuoteFormModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        initialData={active ?? undefined}
      />
      {toast && (
        <div
          className={`fixed top-4 right-4 text-white px-4 py-2 rounded ${toast.success ? "bg-green-600" : "bg-red-600"}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default QuotesPage;
