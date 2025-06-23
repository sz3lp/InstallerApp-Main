import React, { useState } from "react";
import { SZModal } from "../ui/SZModal";
import { SZButton } from "../ui/SZButton";
import { SZInput } from "../ui/SZInput";
import useClients from "../../lib/hooks/useClients";
import useMaterials from "../../lib/hooks/useMaterials";
import useQuotes from "../../lib/hooks/useQuotes";

export type CreateQuoteWizardProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const CreateQuoteWizard: React.FC<CreateQuoteWizardProps> = ({
  isOpen,
  onClose,
}) => {
  const [clients] = useClients();
  const { materials } = useMaterials();
  const [, { createQuote }] = useQuotes();

  const [clientId, setClientId] = useState("");
  const [lineItems, setLineItems] = useState<{
    material_id: string;
    quantity: number;
    price: number;
  }[]>([]);
  const [saving, setSaving] = useState(false);

  const addLine = () =>
    setLineItems((ls) => [
      ...ls,
      { material_id: "", quantity: 1, price: 0 },
    ]);

  const removeLine = (index: number) =>
    setLineItems((ls) => ls.filter((_, i) => i !== index));

  const updateLine = (
    idx: number,
    key: "material_id" | "quantity" | "price",
    value: string | number,
  ) => {
    setLineItems((ls) =>
      ls.map((l, i) => (i === idx ? { ...l, [key]: value } : l)),
    );
  };

  const totals = lineItems.map((l) => l.quantity * l.price);
  const grandTotal = totals.reduce((s, t) => s + t, 0);

  const submit = async () => {
    if (!clientId || lineItems.length === 0) return;
    setSaving(true);
    try {
      await createQuote({
        client_id: clientId,
        items: lineItems.map((l) => ({
          description:
            materials.find((m) => m.id === l.material_id)?.name || "",
          quantity: l.quantity,
          unit_price: l.price,
          total: l.quantity * l.price,
        })),
      });
      onClose();
      setClientId("");
      setLineItems([]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SZModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Quote"
      footer={
        <div className="flex justify-end gap-2">
          <SZButton variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </SZButton>
          <SZButton onClick={submit} isLoading={saving} disabled={!clientId}>
            Submit
          </SZButton>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="quote_client" className="block text-sm font-medium text-gray-700">
            Client
          </label>
          <select
            id="quote_client"
            className="border rounded px-3 py-2 w-full"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">Select</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          {lineItems.map((line, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-2 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor={`mat_${idx}`}>Material</label>
                <select
                  id={`mat_${idx}`}
                  className="border rounded px-2 py-1 w-full"
                  value={line.material_id}
                  onChange={(e) =>
                    updateLine(idx, "material_id", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <SZInput
                id={`qty_${idx}`}
                label="Qty"
                type="number"
                value={String(line.quantity)}
                onChange={(v) => updateLine(idx, "quantity", Number(v))}
              />
              <SZInput
                id={`price_${idx}`}
                label="Price"
                type="number"
                value={String(line.price)}
                onChange={(v) => updateLine(idx, "price", Number(v))}
              />
              <div className="pt-6">${(line.quantity * line.price).toFixed(2)}</div>
              <div className="pt-6 text-right">
                <SZButton
                  size="sm"
                  variant="destructive"
                  onClick={() => removeLine(idx)}
                >
                  Remove
                </SZButton>
              </div>
            </div>
          ))}
          <SZButton size="sm" variant="secondary" onClick={addLine}>
            Add Line
          </SZButton>
        </div>
        <div className="font-semibold text-right">Total: ${grandTotal.toFixed(2)}</div>
      </div>
    </SZModal>
  );
};

export default CreateQuoteWizard;
