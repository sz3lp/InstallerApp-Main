import React, { useState, useEffect } from "react";
import { SZModal } from "../../../components/ui/SZModal";
import { SZTable } from "../../../components/ui/SZTable";
import { SZButton } from "../../../components/ui/SZButton";
import { useJobMaterials } from "../../../lib/hooks/useJobMaterials";
import useAuth from "../../../lib/hooks/useAuth";
import uploadDocument from "../../../lib/uploadDocument";
import supabase from "../../../lib/supabaseClient";
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
  const { items, fetchItems } = useJobMaterials(jobId || "");
  const { session } = useAuth();
  const { items, fetchItems } = useJobMaterials(jobId || "");
  const { session } = useAuth();



  const { items, fetchItems } = useJobMaterials(jobId || "");
  const { session } = useAuth();
  const { items, fetchItems } = useJobMaterials(jobId || "");
  const { session } = useAuth();
  const { items, fetchItems } = useJobMaterials(jobId || "");
  const { session } = useAuth();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [photos, setPhotos] = useState<Record<string, File | null>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const q: Record<string, number> = {};
    items.forEach((it) => {
      q[it.id] = 0;
    });
    setQuantities(q);
    setPhotos({});
  }, [isOpen, items]);

  const updateQty = (id: string, qty: number) => {
    setQuantities((q) => ({ ...q, [id]: qty }));
  };

  const updatePhoto = (id: string, file: File | null) => {
    setPhotos((p) => ({ ...p, [id]: file }));
  };

  const canSubmit = Object.values(quantities).some((q) => q > 0);

  const handleSubmit = async () => {
    if (!jobId || !session?.user?.id || !canSubmit) return;
    setSaving(true);
    for (const item of items) {
      const qty = quantities[item.id] || 0;
      if (qty <= 0) continue;
      let photoUrl: string | null = null;
      const file = photos[item.id];
      if (file) {
        const uploaded = await uploadDocument(file);
        photoUrl = uploaded?.url ?? null;
      }
      await supabase.from("job_materials_used").insert({
        job_id: jobId,
        material_id: item.material_id,
        quantity: qty,
        installer_id: session.user.id,
        photo_url: photoUrl,
      });
      await supabase
        .from("job_materials")
        .update({ used_quantity: item.used_quantity + qty })
        .eq("id", item.id);
    }
    await fetchItems();
    setSaving(false);
    onClose();
  };

  return (
    <SZModal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Materials Used"
      footer={
        <div className="flex justify-end gap-2">
          <SZButton variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </SZButton>
          <SZButton onClick={handleSubmit} disabled={!canSubmit} isLoading={saving}>
            Submit
          </SZButton>
        </div>
      }
    >
      {items.length === 0 ? (
        <p>No materials assigned.</p>
      ) : (
        <SZTable headers={["Material", "Qty", "Use", "Photo"]}>
          {items.map((m) => (
            <tr key={m.id} className="border-t">
              <td className="p-2 border">{m.material_id}</td>
              <td className="p-2 border text-right">{m.quantity}</td>
              <td className="p-2 border">
                <input
                  type="number"
                  min="0"
                  className="border rounded px-2 py-1 w-20"
                  value={quantities[m.id] ?? 0}
                  onChange={(e) => updateQty(m.id, Number(e.target.value))}
                />
              </td>
              <td className="p-2 border">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => updatePhoto(m.id, e.target.files?.[0] ?? null)}
                />
              </td>
            </tr>
          ))}
        </SZTable>
      )}
      )}


      )}

      )
       
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
