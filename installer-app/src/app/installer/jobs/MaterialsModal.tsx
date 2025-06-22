import React, { useState, useEffect } from "react";
import { SZModal } from "../../../components/ui/SZModal";
import { SZTable } from "../../../components/ui/SZTable";
import { SZButton } from "../../../components/ui/SZButton";
import { useJobMaterials } from "../../../lib/hooks/useJobMaterials";
import useAuth from "../../../lib/hooks/useAuth";
import uploadDocument from "../../../lib/uploadDocument";
import supabase from "../../../lib/supabaseClient";

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

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [overages, setOverages] = useState<Record<string, boolean>>({});
  const [photos, setPhotos] = useState<Record<string, File | null>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const q: Record<string, number> = {};
    const o: Record<string, boolean> = {};
    items.forEach((it) => {
      q[it.id] = 0;
      o[it.id] = false;
    });
    setQuantities(q);
    setOverages(o);
    setPhotos({});
  }, [isOpen, items]);

  const updateQty = (id: string, qty: number) => {
    setQuantities((q) => ({ ...q, [id]: qty }));
    const item = items.find((it) => it.id === id);
    if (item) {
      setOverages((o) => ({ ...o, [id]: qty > item.quantity }));
    }
  };

  const updatePhoto = (id: string, file: File | null) => {
    setPhotos((p) => ({ ...p, [id]: file }));
  };

  const canSubmit =
    Object.values(quantities).some((q) => q > 0) &&
    Object.values(overages).every((v) => !v);

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
          <SZButton
            onClick={handleSubmit}
            disabled={!canSubmit}
            isLoading={saving}
          >
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
                {overages[m.id] && (
                  <div className="text-xs text-red-600 mt-1 space-y-1">
                    <p>
                      Entered quantity exceeds quoted amount. Please contact
                      your manager before proceeding.
                    </p>
                    <button
                      type="button"
                      className="text-blue-600 underline"
                      onClick={() => null}
                    >
                      Contact Manager
                    </button>
                  </div>
                )}
              </td>
              <td className="p-2 border">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    updatePhoto(m.id, e.target.files?.[0] ?? null)
                  }
                />
              </td>
            </tr>
          ))}
        </SZTable>
      )}
    </SZModal>
  );
};

export default MaterialsModal;
