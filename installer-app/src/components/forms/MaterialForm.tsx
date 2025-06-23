import React, { useState } from "react";
import ModalWrapper from "../../installer/components/ModalWrapper";
import { SZInput } from "../ui/SZInput";
import { SZButton } from "../ui/SZButton";
import { Material } from "../../lib/hooks/useMaterials";

interface Props {
  material?: Material;
  onSave: (data: Omit<Material, "id">) => Promise<void>;
  onClose: () => void;
}

const MaterialForm: React.FC<Props> = ({ material, onSave, onClose }) => {
  const [form, setForm] = useState<Omit<Material, "id">>({
    name: material?.name ?? "",
    sku: material?.sku ?? "",
    category: material?.category ?? "",
    base_cost: material?.base_cost ?? 0,
    default_sale_price: material?.default_sale_price ?? 0,
    default_pay_rate: material?.default_pay_rate ?? 0,
    active: material?.active ?? true,
  });
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!form.name) {
      setError("Name is required");
      return;
    }
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <ModalWrapper isOpen={true} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">
        {material ? "Edit Material" : "New Material"}
      </h2>
      <div className="space-y-2">
        <SZInput
          id="mat_name"
          label="Name"
          value={form.name}
          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
        />
        <SZInput
          id="mat_sku"
          label="SKU"
          value={form.sku ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, sku: v }))}
        />
        <SZInput
          id="mat_category"
          label="Category"
          value={form.category ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, category: v }))}
        />
        <SZInput
          id="mat_base_cost"
          label="Base Cost"
          type="number"
          value={String(form.base_cost ?? 0)}
          onChange={(v) => setForm((f) => ({ ...f, base_cost: Number(v) }))}
        />
        <SZInput
          id="mat_sale_price"
          label="Default Sale Price"
          type="number"
          value={String(form.default_sale_price ?? 0)}
          onChange={(v) =>
            setForm((f) => ({ ...f, default_sale_price: Number(v) }))
          }
        />
        <SZInput
          id="mat_pay_rate"
          label="Default Pay Rate"
          type="number"
          value={String(form.default_pay_rate ?? 0)}
          onChange={(v) =>
            setForm((f) => ({ ...f, default_pay_rate: Number(v) }))
          }
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.active ?? true}
            onChange={(e) =>
              setForm((f) => ({ ...f, active: e.target.checked }))
            }
          />
          Active
        </label>
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

export default MaterialForm;
