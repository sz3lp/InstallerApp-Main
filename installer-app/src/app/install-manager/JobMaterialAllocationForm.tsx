import React, { useEffect, useState } from "react";
import useAuth from "../../lib/hooks/useAuth";
import supabase from "../../lib/supabaseClient";
import { SZButton } from "../../components/ui/SZButton";

interface Props {
  jobId: string;
  onAllocated?: () => void;
}

interface InventoryRow {
  material_type_id: string;
  name: string | null;
  current_qty: number;
}

const JobMaterialAllocationForm: React.FC<Props> = ({ jobId, onAllocated }) => {
  const { role } = useAuth();
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [materialId, setMaterialId] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadInventory() {
      const { data, error } = await supabase
        .from("inventory_levels")
        .select("material_type_id, current_qty, material_types(name)");
      if (error) return console.error(error);
      const mapped = (data ?? []).map((row: any) => ({
        material_type_id: row.material_type_id,
        current_qty: row.current_qty,
        name: row.material_types?.name ?? null,
      }));
      setInventory(mapped);
    }
    loadInventory();
  }, []);

  if (role !== "Install Manager" && role !== "Admin") {
    return <p className="p-4">Access denied</p>;
  }

  const currentStock = inventory.find((i) => i.material_type_id === materialId);

  const handleSubmit = async () => {
    if (!materialId || !qty) return;
    if (currentStock && qty > currentStock.current_qty) {
      setError("Insufficient stock available");
      return;
    }
    setError(null);
    setSaving(true);
    const { error } = await supabase.rpc("allocate_material_to_job", {
      job_id_input: jobId,
      material_type_id_input: materialId,
      qty_input: qty,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
      setMaterialId("");
      setQty(1);
      if (onAllocated) onAllocated();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="mat">
          Material Type
        </label>
        <select
          id="mat"
          className="border rounded px-3 py-2 w-full"
          value={materialId}
          onChange={(e) => setMaterialId(e.target.value)}
        >
          <option value="">Select</option>
          {inventory.map((inv) => (
            <option key={inv.material_type_id} value={inv.material_type_id}>
              {inv.name ?? inv.material_type_id} ({inv.current_qty})
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
        {currentStock && (
          <p className="text-xs text-gray-500">
            Available: {currentStock.current_qty}
          </p>
        )}
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <SZButton onClick={handleSubmit} isLoading={saving} disabled={!materialId}>
        Allocate
      </SZButton>
    </div>
  );
};

export default JobMaterialAllocationForm;
