import React, { useEffect, useState } from "react";
import { SZModal } from "../../components/ui/SZModal";
import { SZButton } from "../../components/ui/SZButton";
import supabase from "../../lib/supabaseClient";
import { useJobMaterials } from "../../lib/hooks/useJobMaterials";

export type AssignInventoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
};

const AssignInventoryModal: React.FC<AssignInventoryModalProps> = ({
  isOpen,
  onClose,
  jobId,
}) => {
  const { addMaterial, fetchItems } = useJobMaterials(jobId || "");
  const [materials, setMaterials] = useState<{ id: string; name: string }[]>([]);
  const [materialId, setMaterialId] = useState("");
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    async function loadMaterials() {
      const { data } = await supabase
        .from<{ id: string; name: string }>("materials")
        .select("id, name");
      setMaterials(data ?? []);
    }
    loadMaterials();
  }, [isOpen]);

  const handleAdd = async () => {
    if (!jobId || !materialId) return;
    setSubmitting(true);
    try {
      await addMaterial(materialId, qty);
      await fetchItems();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SZModal isOpen={isOpen} onClose={onClose} title="Assign Inventory">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="material">
            Material
          </label>
          <select
            id="material"
            className="border rounded px-3 py-2 w-full"
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
          >
            <option value="">Select</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="qty">
            Quantity
          </label>
          <input
            id="qty"
            type="number"
            min={1}
            className="border rounded px-3 py-2 w-full"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <SZButton variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </SZButton>
        <SZButton onClick={handleAdd} isLoading={submitting}>
          Add
        </SZButton>
      </div>
    </SZModal>
  );
};

export default AssignInventoryModal;
