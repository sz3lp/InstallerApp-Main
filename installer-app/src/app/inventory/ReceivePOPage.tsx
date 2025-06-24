import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { SZTable } from "../../components/ui/SZTable";
import { SZButton } from "../../components/ui/SZButton";
import { SZInput } from "../../components/ui/SZInput";
import { LoadingState, ErrorState } from "../../components/states";
import supabase from "../../lib/supabaseClient";
import { useAuth } from "../../lib/hooks/useAuth";

interface POItem {
  id: string;
  material_id: string;
  material_name: string;
  ordered_qty: number;
  received_qty: number;
}

export default function ReceivePOPage() {
  const { poId } = useParams<{ poId: string }>();
  const { role } = useAuth();
  const [items, setItems] = useState<POItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("purchase_order_items")
        .select(
          "id, material_id, qty, received_qty, materials(name)"
        )
        .eq("order_id", poId);
      if (error) {
        setError(error.message);
        setItems([]);
      } else {
        const mapped = (data ?? []).map((row: any) => ({
          id: row.id,
          material_id: row.material_id,
          material_name: row.materials?.name ?? row.material_id,
          ordered_qty: row.qty,
          received_qty: row.received_qty ?? 0,
        }));
        setItems(mapped);
        setError(null);
      }
      setLoading(false);
    };
    if (poId) fetchItems();
  }, [poId]);

  const handleSave = async () => {
    setSaving(true);
    for (const item of items) {
      const qty = Number(inputs[item.id] || 0);
      if (!qty) continue;
      const { error } = await supabase.rpc("receive_po_item", {
        p_item_id: item.id,
        p_qty: qty,
      });
      if (error) {
        setError(error.message);
        break;
      }
    }
    setSaving(false);
    setInputs({});
  };

  if (role !== "Admin" && role !== "Install Manager") {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Receive Purchase Order</h1>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <>
          <SZTable headers={["Material", "Ordered", "Received", "Receive"]}>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2 border">{item.material_name}</td>
                <td className="p-2 border text-right">{item.ordered_qty}</td>
                <td className="p-2 border text-right">{item.received_qty}</td>
                <td className="p-2 border">
                  <SZInput
                    id={`recv_${item.id}`}
                    type="number"
                    value={String(inputs[item.id] ?? "")}
                    onChange={(v) =>
                      setInputs((i) => ({ ...i, [item.id]: Number(v) }))
                    }
                    className="w-24"
                  />
                </td>
              </tr>
            ))}
          </SZTable>
          <div className="flex justify-end">
            <SZButton onClick={handleSave} isLoading={saving}>
              Save Receipt
            </SZButton>
          </div>
        </>
      )}
    </div>
  );
}
