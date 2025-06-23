import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { SZTable } from "../../components/ui/SZTable";
import { SZButton } from "../../components/ui/SZButton";
import useQuotes from "../../lib/hooks/useQuotes";
import { useAuth } from "../../lib/hooks/useAuth";

const QuoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const [quotes, { updateQuoteStatus }] = useQuotes();
  const quote = useMemo(() => quotes.find((q) => q.id === id), [quotes, id]);

  if (!quote) return <div className="p-4">Loading...</div>;

  const canEdit = role === "Sales" && user?.id === quote.created_by && quote.status === "draft";
  const showAdminActions = role === "Admin" && quote.status === "pending";

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Quote Detail</h1>
      <div>Status: {quote.status}</div>
      <div>Client: {quote.client_name}</div>
      <div className="overflow-x-auto">
        <SZTable headers={["Description", "Qty", "Price", "Total"]}>
          {quote.items?.map((it) => (
            <tr key={it.id} className="border-t">
              <td className="p-2 border">{it.description}</td>
              <td className="p-2 border">{it.quantity}</td>
              <td className="p-2 border">${it.unit_price.toFixed(2)}</td>
              <td className="p-2 border">${(it.total ?? it.quantity * it.unit_price).toFixed(2)}</td>
            </tr>
          ))}
        </SZTable>
      </div>
      {canEdit && (
        <SZButton size="sm" onClick={() => updateQuoteStatus(quote.id, "pending")}>
          Submit for Approval
        </SZButton>
      )}
      {showAdminActions && (
        <div className="space-x-2">
          <SZButton size="sm" onClick={() => updateQuoteStatus(quote.id, "approved")}>
            Approve
          </SZButton>
          <SZButton size="sm" variant="destructive" onClick={() => updateQuoteStatus(quote.id, "rejected")}>
            Reject
          </SZButton>
        </div>
      )}
      <Link to="/quotes" className="underline text-blue-600">
        Back
      </Link>
    </div>
  );
};

export default QuoteDetailPage;
