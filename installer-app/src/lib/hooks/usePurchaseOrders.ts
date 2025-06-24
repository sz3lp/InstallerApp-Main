import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface PurchaseOrder {
  id: string;
  supplier: string;
  order_date: string;
  status: string;
}

export interface PurchaseOrderItem {
  id: string;
  order_id: string;
  material_type_id: string;
  qty: number;
}

export default function usePurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("purchase_orders")
      .select("id, supplier, order_date, status")
      .order("order_date", { ascending: false });
    if (error) {
      setError(error.message);
      setOrders([]);
    } else {
      setOrders(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  const createOrder = useCallback(
    async (order: {
      supplier: string;
      order_date: string;
      items: { material_type_id: string; qty: number }[];
    }) => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .insert({
          supplier: order.supplier,
          order_date: order.order_date,
          status: "draft",
        })
        .select()
        .single();
      if (error) throw error;
      if (order.items.length) {
        const rows = order.items.map((i) => ({ ...i, order_id: data.id }));
        const { error: itemErr } = await supabase
          .from("purchase_order_items")
          .insert(rows);
        if (itemErr) throw itemErr;
      }
      await fetchOrders();
      return data as PurchaseOrder;
    },
    [fetchOrders],
  );

  const updateStatus = useCallback(async (id: string, status: string) => {
    const { data, error } = await supabase
      .from("purchase_orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setOrders((list) => list.map((o) => (o.id === id ? (data as PurchaseOrder) : o)));
    return data as PurchaseOrder;
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateStatus,
  } as const;
}
