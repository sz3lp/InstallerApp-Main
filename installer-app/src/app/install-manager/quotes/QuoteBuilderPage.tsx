import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SZInput } from "../../../components/ui/SZInput";
import { SZTextarea } from "../../../components/ui/SZTextarea";
import { SZButton } from "../../../components/ui/SZButton";
import supabase from "../../../lib/supabaseClient";
import { useAuth } from "../../../lib/hooks/useAuth";

interface Client {
  id: string;
  name: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

const blankItem: LineItem = { description: "", quantity: 1, unit_price: 0 };

const QuoteBuilderPage: React.FC = () => {
  const { role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && role !== "InstallManager") {
      navigate("/login", { replace: true });
    }
  }, [role, authLoading, navigate]);

  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase
        .from<Client>("clients")
        .select("id, name")
        .order("name");
      setClients(data ?? []);
      setClientsLoading(false);
    };
    fetchClients();
  }, []);

  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ ...blankItem }]);
  const [tax, setTax] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"draft" | "sent">("draft");
  const [saving, setSaving] = useState(false);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleItemChange = (
    index: number,
    key: keyof LineItem,
    value: string | number,
  ) => {
    setItems((its) =>
      its.map((it, i) => (i === index ? { ...it, [key]: value } : it)),
    );
  };

  const addItem = () => setItems((its) => [...its, { ...blankItem }]);
  const removeItem = (idx: number) =>
    setItems((its) => its.filter((_, i) => i !== idx));

  const subtotal = items.reduce(
    (sum, it) => sum + it.quantity * it.unit_price,
    0,
  );
  const taxRate = parseFloat(tax) || 0;
  const total = subtotal + subtotal * (taxRate / 100);

  const saveDraft = async () => {
    if (items.length === 0) {
      alert("Quote must have at least one line item");
      return null;
    }
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let id = quoteId;
    if (!id) {
      const { data, error } = await supabase
        .from("quotes")
        .insert({
          client_id: clientId || null,
          created_by: user?.id ?? null,
          title: title || null,
          status: "draft",
        })
        .select()
        .single();
      if (error || !data) {
        setSaving(false);
        return null;
      }
      id = data.id as string;
      setQuoteId(id);
    } else {
      await supabase
        .from("quotes")
        .update({ client_id: clientId || null, title: title || null })
        .eq("id", id);
      await supabase.from("quote_items").delete().eq("quote_id", id);
    }

    const rows = items.map((it) => ({
      quote_id: id!,
      description: it.description,
      quantity: it.quantity,
      unit_price: it.unit_price,
      total: it.quantity * it.unit_price,
    }));
    if (rows.length) {
      await supabase.from("quote_items").insert(rows);
    }

    setSaving(false);
    setStatus("draft");
    setToast("Draft saved");
    setTimeout(() => setToast(null), 3000);
    return id;
  };

  const handleSend = async () => {
    const id = await saveDraft();
    if (!id) return;
    await supabase.from("quotes").update({ status: "sent" }).eq("id", id);
    setStatus("sent");
    setToast("Quote sent");
    setTimeout(() => setToast(null), 3000);
  };

  const inputsDisabled = status !== "draft";

  if (authLoading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Create Quote</h1>
      {clientsLoading ? (
        <p>Loading clients...</p>
      ) : (
        <div>
          <label htmlFor="client" className="block text-sm font-medium text-gray-700">
            Client
          </label>
          <select
            id="client"
            className="border rounded px-3 py-2 w-full"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            disabled={inputsDisabled}
          >
            <option value="">Select</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <SZInput
        id="quote_title"
        label="Title"
        value={title}
        onChange={setTitle}
        disabled={inputsDisabled}
      />
      <div className="space-y-2">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Unit Price</th>
              <th className="p-2 border">Total</th>
              {status === "draft" && <th className="p-2 border" />}
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2 border">
                  <input
                    type="text"
                    className="border rounded px-2 py-1 w-full"
                    value={it.description}
                    onChange={(e) =>
                      handleItemChange(idx, "description", e.target.value)
                    }
                    disabled={inputsDisabled}
                  />
                </td>
                <td className="p-2 border">
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-20"
                    value={it.quantity}
                    min={1}
                    onChange={(e) =>
                      handleItemChange(idx, "quantity", Number(e.target.value))
                    }
                    disabled={inputsDisabled}
                  />
                </td>
                <td className="p-2 border">
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-24"
                    value={it.unit_price}
                    onChange={(e) =>
                      handleItemChange(idx, "unit_price", Number(e.target.value))
                    }
                    disabled={inputsDisabled}
                  />
                </td>
                <td className="p-2 border text-right">
                  {(it.quantity * it.unit_price).toFixed(2)}
                </td>
                {status === "draft" && (
                  <td className="p-2 border text-center">
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() => removeItem(idx)}
                    >
                      X
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {status === "draft" && (
          <SZButton size="sm" variant="secondary" onClick={addItem}>
            Add Line
          </SZButton>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SZInput
          id="tax"
          label="Tax %"
          value={tax}
          onChange={setTax}
          disabled={inputsDisabled}
        />
        <SZTextarea
          id="notes"
          label="Notes"
          value={notes}
          onChange={setNotes}
          disabled={inputsDisabled}
          rows={3}
        />
      </div>
      <div className="font-semibold text-lg">Total: ${total.toFixed(2)}</div>
      {status === "draft" && (
        <div className="flex gap-2">
          <SZButton onClick={saveDraft} isLoading={saving}>
            Save Draft
          </SZButton>
          <SZButton onClick={handleSend} variant="secondary" isLoading={saving}>
            Send Quote
          </SZButton>
        </div>
      )}
      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded">
          {toast}
        </div>
      )}
    </div>
  );
};

export default QuoteBuilderPage;

