import React, { useState, useEffect } from "react";
import supabase from "../../../lib/supabaseClient";
import { useAuth } from "../../../lib/hooks/useAuth";

export default function QuoteBuilderPage() {
  const { user, role } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [title, setTitle] = useState("");
  const [lineItems, setLineItems] = useState([
    { description: "", quantity: 1, unit_price: 0 },
  ]);
  const [status, setStatus] = useState("draft");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(0);

  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase.from("clients").select("id, name");
      setClients(data || []);
    }
    fetchClients();
  }, []);

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    // @ts-ignore
    updatedItems[index][field] = value;
    setLineItems(updatedItems);
  };

  const addLineItem = () =>
    setLineItems([
      ...lineItems,
      { description: "", quantity: 1, unit_price: 0 },
    ]);
  const removeLineItem = (index) => {
    const updated = lineItems.filter((_, i) => i !== index);
    setLineItems(updated);
  };

  const total = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );
  const totalWithTax = total + (total * taxRate) / 100;

  const handleSave = async (send = false) => {
    const { data: quote, error } = await supabase
      .from("quotes")
      .insert({
        client_id: selectedClient,
        created_by: user.id,
        title,
        status: send ? "sent" : "draft",
      })
      .select()
      .single();

    if (!quote) return alert("Failed to create quote.");

    const itemsPayload = lineItems.map((item) => ({
      quote_id: quote.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
    }));

    await supabase.from("quote_items").insert(itemsPayload);
    alert(`Quote ${send ? "sent" : "saved"} successfully.`);
  };

  if (role !== "Install Manager") {
    return <div className="p-4 text-red-600">Access denied.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Create Quote</h1>
      <div className="space-y-2">
        <label>Client</label>
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Select a client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Quote Title"
        className="border p-2 w-full"
      />
      <div className="space-y-2">
        <h2 className="font-semibold">Line Items</h2>
        {lineItems.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              value={item.description}
              onChange={(e) =>
                handleLineItemChange(idx, "description", e.target.value)
              }
              placeholder="Description"
              className="border p-1 flex-1"
            />
            <input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                handleLineItemChange(
                  idx,
                  "quantity",
                  parseFloat(e.target.value),
                )
              }
              className="border p-1 w-24"
            />
            <input
              type="number"
              value={item.unit_price}
              onChange={(e) =>
                handleLineItemChange(
                  idx,
                  "unit_price",
                  parseFloat(e.target.value),
                )
              }
              className="border p-1 w-24"
            />
            <button
              onClick={() => removeLineItem(idx)}
              className="text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
        <button onClick={addLineItem} className="text-blue-600 underline">
          Add Line Item
        </button>
      </div>
      <div>
        <label>Tax Rate (%)</label>
        <input
          type="number"
          value={taxRate}
          onChange={(e) => setTaxRate(parseFloat(e.target.value))}
          className="border p-1 w-24"
        />
      </div>
      <div>
        <label>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      <div className="font-semibold">Total: ${totalWithTax.toFixed(2)}</div>
      <div className="flex gap-4">
        <button
          onClick={() => handleSave(false)}
          className="bg-gray-200 px-4 py-2"
        >
          Save Draft
        </button>
        <button
          onClick={() => handleSave(true)}
          className="bg-blue-600 text-white px-4 py-2"
        >
          Send Quote
        </button>
      </div>
    </div>
  );
}
