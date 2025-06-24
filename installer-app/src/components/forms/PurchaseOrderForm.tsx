import React, { useState, useEffect } from "react";
import ModalWrapper from "../../installer/components/ModalWrapper";
import { SZInput } from "../ui/SZInput";
import { SZButton } from "../ui/SZButton";
import useMaterialTypes from "../../lib/hooks/useMaterialTypes";

export type PurchaseOrderInput = {
  supplier: string;
  order_date: string;
  items: { material_type_id: string; qty: number }[];
};

export type PurchaseOrderFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: PurchaseOrderInput) => void;
};

const blankItem = { id: "", material_type_id: "", qty: 1 };

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { materials } = useMaterialTypes();
  const [supplier, setSupplier] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [items, setItems] = useState([ { ...blankItem } ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) return;
    setSupplier("");
    setOrderDate("");
    setItems([ { ...blankItem } ]);
    setError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const addItem = () =>
    setItems((its) => [...its, { ...blankItem, id: Date.now().toString() }]);

  const removeItem = (idx: number) =>
    setItems((its) => its.filter((_, i) => i !== idx));

  const updateItem = (
    idx: number,
    key: "material_type_id" | "qty",
    value: string | number,
  ) => {
    setItems((its) => its.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  };

  const save = () => {
    if (!supplier) {
      setError("Supplier is required");
      return;
    }
    if (!orderDate) {
      setError("Order date is required");
      return;
    }
    if (items.some((i) => !i.material_type_id || i.qty <= 0)) {
      setError("All items must have material and qty");
      return;
    }
    onSave({
      supplier,
      order_date: orderDate,
      items: items.map(({ material_type_id, qty }) => ({ material_type_id, qty })),
    });
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">New Purchase Order</h2>
      <div className="space-y-2">
        <SZInput id="po_supplier" label="Supplier" value={supplier} onChange={setSupplier} />
        <SZInput id="po_date" label="Order Date" type="date" value={orderDate} onChange={setOrderDate} />
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-2 items-end">
              <div className="col-span-2">
                <label htmlFor={`mat_${idx}`} className="block text-sm font-medium text-gray-700">
                  Material
                </label>
                <select
                  id={`mat_${idx}`}
                  className="border rounded px-3 py-2 w-full"
                  value={item.material_type_id}
                  onChange={(e) => updateItem(idx, "material_type_id", e.target.value)}
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
                value={String(item.qty)}
                onChange={(v) => updateItem(idx, "qty", Number(v))}
              />
              <div className="pb-3">
                <SZButton size="sm" variant="destructive" onClick={() => removeItem(idx)}>
                  Remove
                </SZButton>
              </div>
            </div>
          ))}
          <SZButton size="sm" variant="secondary" onClick={addItem}>
            Add Item
          </SZButton>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <SZButton variant="secondary" onClick={onClose}>
          Cancel
        </SZButton>
        <SZButton onClick={save}>Save</SZButton>
      </div>
    </ModalWrapper>
  );
};

export default PurchaseOrderForm;
