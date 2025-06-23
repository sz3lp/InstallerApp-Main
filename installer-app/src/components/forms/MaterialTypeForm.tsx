import React, { useState } from "react";
import ModalWrapper from "../../installer/components/ModalWrapper";
import { SZInput } from "../ui/SZInput";
import { SZButton } from "../ui/SZButton";
import { MaterialType } from "../../lib/hooks/useMaterialTypes";

interface Props {
  material?: MaterialType;
  onSave: (data: Omit<MaterialType, "id" | "created_at">) => Promise<void>;
  onClose: () => void;
}

const MaterialTypeForm: React.FC<Props> = ({ material, onSave, onClose }) => {
  const [form, setForm] = useState<Omit<MaterialType, "id" | "created_at">>({
    name: material?.name ?? "",
    unit_of_measure: material?.unit_of_measure ?? "",
    default_cost: material?.default_cost ?? 0,
    retail_price: material?.retail_price ?? 0,
  });
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!form.name) {
      setError("Name is required");
      return;
    }
    if (!form.unit_of_measure) {
      setError("Unit of measure is required");
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
          id="mat_uom"
          label="Unit of Measure"
          value={form.unit_of_measure}
          onChange={(v) => setForm((f) => ({ ...f, unit_of_measure: v }))}
        />
        <SZInput
          id="mat_default_cost"
          label="Default Cost"
          type="number"
          value={String(form.default_cost ?? 0)}
          onChange={(v) => setForm((f) => ({ ...f, default_cost: Number(v) }))}
        />
        <SZInput
          id="mat_retail_price"
          label="Retail Price"
          type="number"
          value={String(form.retail_price ?? 0)}
          onChange={(v) => setForm((f) => ({ ...f, retail_price: Number(v) }))}
        />
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

export default MaterialTypeForm;
