import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import {
  GlobalLoading,
  GlobalError,
} from "../../components/global-states";
import useAuth from "../../lib/hooks/useAuth";
import usePurchaseOrder from "../../lib/hooks/usePurchaseOrder";
import supabase from "../../lib/supabaseClient";

const ReceivePOPage: React.FC = () => {
  const { poId } = useParams<{ poId: string }>();
  const { role } = useAuth();
  const { order, loading, error, refresh } = usePurchaseOrder(poId ?? null);
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!order) return;
    const initial: Record<string, number> = {};
    order.items.forEach((item) => {
      initial[item.id] = item.qty;
    });
    setQtys(initial);
  }, [order]);

  if (role !== "Admin" && role !== "Install Manager") {
    return <Navigate to="/unauthorized" replace />;
  }

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    setSaveError(null);
    const items = order.items.map((it) => ({
      item_id: it.id,
      qty: qtys[it.id] ?? 0,
    }));
    const { error: rpcErr } = await supabase.rpc("receive_purchase_order", {
      po_id: order.id,
      items,
    });
    if (rpcErr) {
      setSaveError(rpcErr.message);
    } else {
      await supabase
        .from("purchase_orders")
        .update({ status: "received" })
        .eq("id", order.id);
      refresh();
    }
    setSaving(false);
  };

  if (loading) return <GlobalLoading />;
  if (error || !order) return <GlobalError message={error || "Order not found"} />;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Receive Purchase Order</h1>
      <p>
        Supplier: {order.supplier} — {new Date(order.order_date).toLocaleDateString()}
      </p>
      {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
      <SZTable headers={["Material", "Ordered Qty", "Received Qty"]}>
        {order.items.map((item) => (
          <tr key={item.id} className="border-t">
            <td className="p-2 border">
              {item.material_name ?? item.material_type_id}
            </td>
            <td className="p-2 border text-right">{item.qty}</td>
            <td className="p-2 border">
              <input
                type="number"
                min={0}
                className="border rounded px-2 py-1 w-24"
                value={qtys[item.id] ?? 0}
                onChange={(e) =>
                  setQtys({ ...qtys, [item.id]: Number(e.target.value) })
                }
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
    </div>
  );
};

export default ReceivePOPage;
