import React, { useState, useMemo } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { SZTable } from "../../../components/ui/SZTable";
import { SZButton } from "../../../components/ui/SZButton";
import { SZInput } from "../../../components/ui/SZInput";
import useQuotes from "../../../lib/hooks/useQuotes";
import useAuth from "../../../lib/hooks/useAuth";
import { GlobalLoading, GlobalEmpty } from "../../../components/global-states";

const QuoteListPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, loading: authLoading } = useAuth();
  const [quotes, { loading }] = useQuotes();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<"new" | "old" | "total">("new");

  if (authLoading) return <GlobalLoading />;
  if (role !== "InstallManager" && role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  const filtered = useMemo(() => {
    let list = quotes;
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (q) =>
          (q.title ?? "").toLowerCase().includes(term) ||
          (q.client_name ?? "").toLowerCase().includes(term),
      );
    }
    if (status !== "all") {
      list = list.filter((q) => q.status === status);
    }
    const sorted = [...list];
    if (sort === "new") {
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    } else if (sort === "old") {
      sorted.sort((a, b) => a.created_at.localeCompare(b.created_at));
    } else if (sort === "total") {
      sorted.sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
    }
    return sorted;
  }, [quotes, search, status, sort]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Quotes</h1>
      <div className="flex flex-wrap gap-2 items-end">
        <div className="w-full sm:w-1/3">
          <SZInput
            id="search"
            placeholder="Search by client or title"
            value={search}
            onChange={setSearch}
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
            Sort By
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="border rounded px-3 py-2"
          >
            <option value="new">Newest</option>
            <option value="old">Oldest</option>
            <option value="total">Total Amount</option>
          </select>
        </div>
      </div>

      {loading ? (
        <GlobalLoading />
      ) : filtered.length === 0 ? (
        <GlobalEmpty message="No quotes found." />
      ) : (
        <div className="overflow-x-auto">
          <SZTable
            headers={["Client Name", "Title", "Status", "Created At", "Total", "Actions"]}
          >
            {filtered.map((q) => (
              <tr key={q.id} className="border-t">
                <td className="p-2 border">{q.client_name}</td>
                <td className="p-2 border">{q.title}</td>
                <td className="p-2 border">{q.status}</td>
                <td className="p-2 border">
                  {new Date(q.created_at).toLocaleDateString()}
                </td>
                <td className="p-2 border">${(q.total ?? 0).toFixed(2)}</td>
                <td className="p-2 border space-x-2">
                  <SZButton
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      navigate(
                        `/install-manager/quotes/QuoteBuilderPage?id=${q.id}`,
                      )
                    }
                  >
                    {q.status === "draft" ? "Edit" : "View"}
                  </SZButton>
                  {q.status === "approved" && (
                    <SZButton
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/install-manager/invoices/NewInvoicePage?quote_id=${q.id}`,
                        )
                      }
                    >
                      Create Invoice
                    </SZButton>
                  )}
                </td>
              </tr>
            ))}
          </SZTable>
        </div>
      )}
    </div>
  );
};

export default QuoteListPage;
