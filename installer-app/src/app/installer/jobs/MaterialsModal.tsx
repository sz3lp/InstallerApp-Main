import React from "react";
import { SZModal } from "../../../components/ui/SZModal";
import { SZTable } from "../../../components/ui/SZTable";
import { useJobMaterials } from "../../../lib/hooks/useJobMaterials";

export type MaterialsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
};

const MaterialsModal: React.FC<MaterialsModalProps> = ({
  isOpen,
  onClose,
  jobId,
}) => {
  const { items, updateUsed } = useJobMaterials(jobId || "");

  return (
    <SZModal isOpen={isOpen} onClose={onClose} title="Log Materials Used">
      <SZTable headers={["Material", "Qty", "Used"]}>
        {items.map((m) => (
          <tr key={m.id} className="border-t">
            <td className="p-2 border">{m.material_id}</td>
            <td className="p-2 border text-right">{m.quantity}</td>
            <td className="p-2 border">
              <input
                type="number"
                value={m.used_quantity}
                className="border rounded px-2 py-1 w-16"
                onChange={(e) => updateUsed(m.id, Number(e.target.value))}
              />
            </td>
          </tr>
        ))}
      </SZTable>
    </SZModal>
  );
};

export default MaterialsModal;
