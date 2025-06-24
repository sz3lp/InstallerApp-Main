import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface PurchaseOrderItemDetail {
  id: string;
  order_id: string;
  material_type_id: string;
  qty: number;
  material_name?: string | null;
}

export interface PurchaseOrderDetail {
  id: string;
  supplier: string;
  order_date: string;
  status: string;
  items: PurchaseOrderItemDetail[];
}

export default function usePurchaseOrder(poId: string | null) {
  const [order, setOrder] = useState<PurchaseOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!poId) {
      setOrder(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("purchase_orders")
      .select(
        "id, supplier, order_date, status, purchase_order_items(id, order_id, material_type_id, qty, material_types(name))"
      )
      .eq("id", poId)
      .single();
    if (error) {
      setError(error.message);
      setOrder(null);
    } else {
      const mapped: PurchaseOrderDetail = {
        id: data.id,
        supplier: data.supplier,
        order_date: data.order_date,
        status: data.status,
        items: (data.purchase_order_items ?? []).map((it: any) => ({
          id: it.id,
          order_id: it.order_id,
          material_type_id: it.material_type_id,
          qty: it.qty,
          material_name: it.material_types?.name ?? null,
        })),
      };
      setOrder(mapped);
      setError(null);
    }
    setLoading(false);
  }, [poId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return { order, loading, error, refresh: fetchOrder } as const;
}
