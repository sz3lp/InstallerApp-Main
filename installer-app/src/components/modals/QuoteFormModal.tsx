import React, { useState, useEffect } from "react";
import ModalWrapper from "../../installer/components/ModalWrapper";
import { SZInput } from "../ui/SZInput";
import { SZButton } from "../ui/SZButton";
import useClients from "../../lib/hooks/useClients";

export interface ServiceLine {
  id: string;
  material: string;
  qty: number;
  price: number;
}

export interface QuoteData {
  id?: string;
  client_id: string;
  client_name?: string;
  lines: ServiceLine[];
  total?: number;
}

export type QuoteFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quote: QuoteData) => void;
  initialData?: QuoteData | null;
};



const blankLine: ServiceLine = { id: "", material: "", qty: 1, price: 0 };

const QuoteFormModal: React.FC<QuoteFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [clients] = useClients();
  const [clientId, setClientId] = useState("");
  const [lines, setLines] = useState<ServiceLine[]>([{ ...blankLine }]);

  useEffect(() => {
    if (initialData) {
      setClientId(initialData.client_id);
      setLines(
        initialData.lines.length ? initialData.lines : [{ ...blankLine }],
      );
    } else {
      setClientId("");
      setLines([{ ...blankLine }]);
    }
  }, [initialData]);

  const handleLineChange = (
    index: number,
    key: keyof ServiceLine,
    value: string | number,
  ) => {
    setLines((ls) =>
      ls.map((l, i) => (i === index ? { ...l, [key]: value } : l)),
    );
  };

  const addLine = () =>
    setLines((ls) => [...ls, { ...blankLine, id: Date.now().toString() }]);

  const removeLine = (idx: number) =>
    setLines((ls) => ls.filter((_, i) => i !== idx));

  const total = lines.reduce((sum, l) => sum + l.qty * l.price, 0);

  const handleSave = () => {
    const client = clients.find((c) => c.id === clientId);
    onSave({ id: initialData?.id, client_id: clientId, client_name: client?.name, lines, total });
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">
        {initialData ? "Edit Quote" : "New Quote"}
      </h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="quote_client"
            className="block text-sm font-medium text-gray-700"
          >
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
          {lines.map((line, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-2 items-end">
              <SZInput
                id={`mat_${idx}`}
                label="Material"
                value={line.material}
                onChange={(v) => handleLineChange(idx, "material", v)}
              />
              <SZInput
                id={`qty_${idx}`}
                label="Qty"
                value={String(line.qty)}
                onChange={(v) => handleLineChange(idx, "qty", Number(v))}
              />
              <SZInput
                id={`price_${idx}`}
                label="Price"
                value={String(line.price)}
                onChange={(v) => handleLineChange(idx, "price", Number(v))}
              />
              <div className="pb-3">
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
        <div className="font-semibold">Total: ${total.toFixed(2)}</div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <SZButton variant="secondary" onClick={onClose}>
          Cancel
        </SZButton>
        <SZButton onClick={handleSave}>Save</SZButton>
      </div>
    </ModalWrapper>
  );
};

export default QuoteFormModal;
